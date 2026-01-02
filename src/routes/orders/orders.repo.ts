import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { CreateOrderBody, GetOrdersQuery } from "./orders.model";
import { Prisma, OrderStatus } from "@prisma/client";

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

@Injectable()
export class OrdersRepo {
    constructor(private readonly prisma: PrismaService) {}

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

        // Calculate total amount
        const totalAmount = cart.cartItems.reduce((sum, item) => {
            const price = item.course?.salePrice || item.course?.price || 0;
            return sum + price;
        }, 0);

        // Create order with order items
        const order = await this.prisma.order.create({
            data: {
                userId,
                totalAmount,
                status: OrderStatus.PENDING,
                orderItems: {
                    create: cart.cartItems.map((item) => ({
                        courseId: item.courseId,
                        price: item.course?.salePrice || item.course?.price || 0,
                    })),
                },
            },
            select: orderSelect,
        });

        // Delete cart after creating order
        await this.prisma.cart.delete({
            where: { userId },
        });

        return order;
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

    async payOrder(orderId: string, userId: string) {
        // Get order
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            select: {
                id: true,
                status: true,
                orderItems: {
                    select: {
                        courseId: true,
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException(`Order is already ${order.status}`);
        }

        // Update order status to PAID
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.PAID },
            select: orderSelect,
        });

        // Create enrollments for all courses in order
        const courseIds = order.orderItems.map((item) => item.courseId);
        
        // Check existing enrollments
        const existingEnrollments = await this.prisma.enrollment.findMany({
            where: {
                userId,
                courseId: { in: courseIds },
            },
            select: { courseId: true },
        });

        const existingCourseIds = new Set(existingEnrollments.map((e) => e.courseId));
        const newCourseIds = courseIds.filter((id) => !existingCourseIds.has(id));

        // Create enrollments for new courses
        if (newCourseIds.length > 0) {
            await this.prisma.enrollment.createMany({
                data: newCourseIds.map((courseId) => ({
                    userId,
                    courseId,
                    completedAt: new Date(), // Đã thanh toán thành công
                })),
            });
        }

        return updated;
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