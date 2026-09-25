import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { CreateOrderBody, GetOrdersQuery } from "./orders.model";
import { Prisma, OrderStatus } from "@prisma/client";
import { CouponsService } from "../coupons/coupons.service";

const orderItemSelect = {
  id: true,
  orderId: true,
  courseId: true,
  price: true,
  course: {
    select: {
      id: true,
      title: true,
      thumbnail: true,
      price: true,
      salePrice: true,
      instructor: { select: { id: true, name: true } },
    },
  },
} as const;

const orderSelect = {
  id: true,
  userId: true,
  totalAmount: true,
  couponCode: true,
  discountAmount: true,
  expiresAt: true,
  status: true,
  createdAt: true,
  orderItems: {
    select: orderItemSelect,
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  },
} as const;

/** Thời gian được thanh toán sau khi tạo đơn (phút, cấu hình bằng ORDER_PAYMENT_TIMEOUT_MINUTES, mặc định 10). */
export function getPaymentTimeoutMs(): number {
    const minutes = Number(process.env.ORDER_PAYMENT_TIMEOUT_MINUTES);
    return (Number.isFinite(minutes) && minutes > 0 ? minutes : 10) * 60 * 1000;
}

@Injectable()
export class OrdersRepo {
    constructor(
        private readonly prisma: PrismaService,
        private readonly couponsService: CouponsService,
    ) {}

    async createOrder(userId: string, body: CreateOrderBody) {
        // Get cart with items
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                cartItems: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                price: true,
                                salePrice: true,
                                status: true,
                                deletedAt: true,
                            },
                        },
                    },
                },
            },
        });

        if (!cart) {
            throw new NotFoundException("Cart not found");
        }

        if (cart.cartItems.length === 0) {
            throw new BadRequestException("Cart is empty");
        }

        // Validate all courses are PUBLISHED
        for (const item of cart.cartItems) {
            if (!item.course) {
                throw new NotFoundException(`Course with ID ${item.courseId} not found`);
            }
            if (item.course.deletedAt !== null) {
                throw new BadRequestException(`Course ${item.course.id} has been deleted`);
            }
            if (item.course.status !== "PUBLISHED") {
                throw new BadRequestException(`Course ${item.course.id} is not PUBLISHED`);
            }
        }

        // Calculate subtotal
        const lines = cart.cartItems.map((item) => ({
            courseId: item.courseId,
            price: item.course?.salePrice || item.course?.price || 0,
        }));
        const subtotal = lines.reduce((sum, l) => sum + l.price, 0);
        const expiresAt = new Date(Date.now() + getPaymentTimeoutMs());

        // Kiểm tra mã, tạo đơn, ghi lượt dùng, xóa giỏ: cùng một transaction (lỗi ở đâu thì không trừ lượt nào).
        return this.prisma.$transaction(
            async (tx) => {
                let totalAmount = subtotal;
                let discountAmount = 0;
                let applied: Awaited<ReturnType<CouponsService["evaluate"]>> | null = null;

                if (body.couponCode) {
                    // Khóa mã trước khi đếm lượt để các đơn dùng cùng mã xếp hàng, không vượt usageLimit
                    await this.couponsService.lockByCode(tx, body.couponCode);
                    applied = await this.couponsService.evaluate(body.couponCode, userId, lines, tx);
                    totalAmount = applied.total;
                    discountAmount = applied.discountAmount;
                }

                const order = await tx.order.create({
                    data: {
                        userId,
                        totalAmount,
                        discountAmount,
                        couponId: applied?.coupon.id,
                        couponCode: applied?.coupon.code,
                        status: OrderStatus.PENDING,
                        expiresAt,
                        orderItems: {
                            create: lines.map((l) => ({ courseId: l.courseId, price: l.price })),
                        },
                    },
                    select: orderSelect,
                });

                if (applied) {
                    await this.couponsService.recordRedemption(tx, {
                        coupon: applied.coupon,
                        userId,
                        orderId: order.id,
                        discountAmount,
                        usedSlots: applied.userSlots,
                    });
                }

                await tx.cart.delete({ where: { userId } });
                return order;
            },
            { timeout: 20000 },
        );
    }

    /**
     * Hủy đơn chưa thanh toán (hết hạn, admin đổi FAILED...): PENDING -> FAILED có điều kiện rồi trả lượt coupon.
     * Đây là NƠI DUY NHẤT nên dùng để hủy đơn PENDING, để lượt coupon không bao giờ bị sót.
     * Trả về false nếu đơn không còn PENDING (đã PAID/FAILED) nên không làm gì.
     */
    async failPendingOrder(orderId: string): Promise<boolean> {
        return this.prisma.$transaction(async (tx) => {
            const res = await tx.order.updateMany({
                where: { id: orderId, status: OrderStatus.PENDING },
                data: { status: OrderStatus.FAILED },
            });
            if (res.count === 0) return false;
            await this.couponsService.releaseByOrder(tx, orderId);
            return true;
        });
    }

    /** Đơn PENDING đã quá hạn thanh toán (kể cả đơn cũ chưa có expiresAt). */
    async findOverduePendingOrderIds(limit = 200): Promise<string[]> {
        const now = new Date();
        const legacyCutoff = new Date(now.getTime() - getPaymentTimeoutMs());
        const rows = await this.prisma.order.findMany({
            where: {
                status: OrderStatus.PENDING,
                OR: [{ expiresAt: { lte: now } }, { expiresAt: null, createdAt: { lte: legacyCutoff } }],
            },
            select: { id: true },
            orderBy: { createdAt: "asc" },
            take: limit,
        });
        return rows.map((r) => r.id);
    }

    async getOrders(query: GetOrdersQuery, userId?: string) {
        const { page, limit, search, status, userId: queryUserId } = query;
        if (page < 1 || limit < 1) {
            throw new BadRequestException("Page and limit must be positive numbers");
        }

        const where: Prisma.OrderWhereInput = {
            ...(userId ? { userId } : {}),
            ...(queryUserId ? { userId: queryUserId } : {}),
            ...(status ? { status: status as OrderStatus } : {}),
            ...(search
                ? {
                      OR: [
                          { user: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                          { user: { email: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                          { orderItems: { some: { course: { title: { contains: search, mode: Prisma.QueryMode.insensitive } } } } },
                      ],
                  }
                : {}),
        };

        const [rows, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip: (page - 1) * limit,
                take: Number(limit),
                orderBy: { createdAt: "desc" },
                select: orderSelect,
            }),
            this.prisma.order.count({ where }),
        ]);

        return {
            data: rows,
            total,
            page,
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        };
    }

    async getOrderById(orderId: string, userId?: string) {
        const where: Prisma.OrderWhereInput = {
            id: orderId,
            ...(userId ? { userId } : {}),
        };

        const order = await this.prisma.order.findFirst({
            where,
            select: orderSelect,
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        return order;
    }

    /**
     * Chốt đơn đã thanh toán: chuyển PENDING -> PAID (có điều kiện) và ghi danh các khóa học trong đơn.
     * Dùng chung cho webhook và luồng kiểm tra thủ công. Chạy song song vẫn an toàn:
     * chỉ một bên chuyển được trạng thái, ghi danh bỏ qua bản ghi trùng.
     */
    async markOrderPaid(
        db: Prisma.TransactionClient,
        orderId: string,
    ): Promise<"PAID" | "ALREADY_PAID" | "NOT_PENDING"> {
        const res = await db.order.updateMany({
            where: { id: orderId, status: OrderStatus.PENDING },
            data: { status: OrderStatus.PAID },
        });

        if (res.count === 0) {
            const current = await db.order.findUnique({ where: { id: orderId }, select: { status: true } });
            if (!current) throw new NotFoundException(`Order with ID ${orderId} not found`);
            return current.status === OrderStatus.PAID ? "ALREADY_PAID" : "NOT_PENDING";
        }

        const order = await db.order.findUniqueOrThrow({
            where: { id: orderId },
            select: { userId: true, orderItems: { select: { courseId: true } } },
        });
        await db.enrollment.createMany({
            data: order.orderItems.map((item) => ({
                userId: order.userId,
                courseId: item.courseId,
                completedAt: new Date(), // Đã thanh toán thành công
            })),
            skipDuplicates: true,
        });
        return "PAID";
    }

    /** Trả về đơn và cờ `transitioned` (true nếu lần gọi này là lần chuyển sang PAID). */
    async payOrder(orderId: string, userId: string) {
        const exists = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            select: { id: true },
        });
        if (!exists) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        const outcome = await this.prisma.$transaction((tx) => this.markOrderPaid(tx, orderId));
        if (outcome === "NOT_PENDING") {
            throw new BadRequestException("Order is not pending");
        }

        const order = await this.prisma.order.findUniqueOrThrow({ where: { id: orderId }, select: orderSelect });
        return { order, transitioned: outcome === "PAID" };
    }

    async updateOrderStatus(orderId: string, status: OrderStatus, userId?: string) {
        const where: Prisma.OrderWhereInput = {
            id: orderId,
            ...(userId ? { userId } : {}),
        };

        const order = await this.prisma.order.findFirst({
            where,
            select: { id: true, status: true },
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status },
            select: orderSelect,
        });

        return updated;
    }
}