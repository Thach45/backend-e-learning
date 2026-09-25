import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Coupon, Prisma } from "@prisma/client";
import { PrismaService } from "src/shared/service/prisma.service";
import { CreateCouponBody, GetCouponsQuery, UpdateCouponBody } from "./coupons.model";

export type CouponLine = { courseId: string; price: number };
type Db = PrismaService | Prisma.TransactionClient;

/**
 * Mô hình lượt dùng: mỗi lần dùng mã là một dòng `CouponRedemption`.
 * - Tổng lượt đã dùng của mã  = số dòng của mã đó (so với `usageLimit`).
 * - Lượt đã dùng của một người = số dòng của người đó (so với `perUserLimit`).
 * - Đơn bị hủy/hết hạn thì dòng bị xóa (`releaseByOrder`) nên lượt tự được trả lại.
 */
@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Khóa dòng coupon trong transaction hiện tại. Những đơn cùng dùng một mã sẽ xếp hàng ở đây,
   * nên việc đếm lượt rồi ghi lượt mới không bị chen ngang (không vượt `usageLimit`).
   */
  async lockByCode(tx: Prisma.TransactionClient, rawCode: string): Promise<void> {
    const code = rawCode.trim().toUpperCase();
    await tx.$queryRaw`SELECT id FROM "Coupon" WHERE code = ${code} FOR UPDATE`;
  }

  /**
   * Kiểm tra mã và tính số tiền giảm cho một giỏ hàng. Ném BadRequest với lý do cụ thể nếu không hợp lệ.
   * Truyền `db` là transaction (đã `lockByCode`) khi dùng để tạo đơn; mặc định đọc trực tiếp (xem trước).
   */
  async evaluate(rawCode: string, userId: string, lines: CouponLine[], db: Db = this.prisma) {
    const code = rawCode.trim().toUpperCase();
    const coupon = await db.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.isActive) throw new BadRequestException("Mã giảm giá không hợp lệ");

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) throw new BadRequestException("Mã giảm giá chưa có hiệu lực");
    if (coupon.expiresAt && coupon.expiresAt < now) throw new BadRequestException("Mã giảm giá đã hết hạn");

    const subtotal = lines.reduce((sum, l) => sum + l.price, 0);
    const eligible = coupon.courseIds.length
      ? lines.filter((l) => coupon.courseIds.includes(l.courseId))
      : lines;
    if (eligible.length === 0) {
      throw new BadRequestException("Mã giảm giá không áp dụng cho các khóa học trong giỏ hàng");
    }
    const eligibleSubtotal = eligible.reduce((sum, l) => sum + l.price, 0);

    if (coupon.minOrderAmount && eligibleSubtotal < coupon.minOrderAmount) {
      throw new BadRequestException(
        `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString("vi-VN")}đ để dùng mã này`,
      );
    }

    if (coupon.usageLimit !== null) {
      const used = await db.couponRedemption.count({ where: { couponId: coupon.id } });
      if (used >= coupon.usageLimit) throw new BadRequestException("Mã giảm giá đã hết lượt sử dụng");
    }
    const userSlots = await this.usedSlots(db, coupon.id, userId);
    if (userSlots.length >= coupon.perUserLimit) {
      throw new BadRequestException("Bạn đã dùng hết lượt của mã này");
    }

    let discount =
      coupon.type === "PERCENT"
        ? (eligibleSubtotal * coupon.value) / 100
        : Math.min(coupon.value, eligibleSubtotal);
    if (coupon.type === "PERCENT" && coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    // Có thể giảm hết (đơn 0đ): cổng thanh toán coi đơn 0đ là đã thanh toán.
    discount = Math.min(Math.round(discount), subtotal);
    if (discount <= 0) throw new BadRequestException("Mã giảm giá không áp dụng được cho đơn hàng này");

    return { coupon, subtotal, discountAmount: discount, total: subtotal - discount, userSlots };
  }

  private async usedSlots(db: Db, couponId: string, userId: string): Promise<number[]> {
    const rows = await db.couponRedemption.findMany({
      where: { couponId, userId },
      select: { slot: true },
    });
    return rows.map((r) => r.slot);
  }

  /**
   * Ghi lượt dùng cho đơn vừa tạo, trong cùng transaction với việc tạo đơn.
   * Ràng buộc duy nhất (couponId, userId, slot) là lớp chặn cuối: hai request cùng lúc của một người
   * không thể cùng chiếm một slot.
   */
  async recordRedemption(
    tx: Prisma.TransactionClient,
    input: { coupon: Coupon; userId: string; orderId: string; discountAmount: number; usedSlots: number[] },
  ) {
    const { coupon, userId, orderId, discountAmount, usedSlots } = input;
    let slot = 1;
    while (usedSlots.includes(slot)) slot++;
    if (slot > coupon.perUserLimit) throw new BadRequestException("Bạn đã dùng hết lượt của mã này");

    try {
      await tx.couponRedemption.create({
        data: { couponId: coupon.id, userId, orderId, slot, discountAmount },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new BadRequestException("Mã giảm giá đang được dùng cho một đơn khác của bạn, vui lòng thử lại");
      }
      throw error;
    }
  }

  /** Trả lại lượt dùng của một đơn (đơn bị hủy hoặc hết hạn thanh toán): xóa dòng redemption. Idempotent. */
  async releaseByOrder(tx: Prisma.TransactionClient, orderId: string): Promise<boolean> {
    const res = await tx.couponRedemption.deleteMany({ where: { orderId } });
    return res.count > 0;
  }

  /** Xem trước giảm giá cho giỏ hàng hiện tại của user. */
  async validateForCart(rawCode: string, userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { cartItems: { include: { course: { select: { id: true, price: true, salePrice: true } } } } },
    });
    if (!cart || cart.cartItems.length === 0) throw new BadRequestException("Giỏ hàng đang trống");

    const lines = cart.cartItems.map((i) => ({
      courseId: i.courseId,
      price: i.course?.salePrice || i.course?.price || 0,
    }));
    const { coupon, subtotal, discountAmount, total } = await this.evaluate(rawCode, userId, lines);
    return {
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      subtotal,
      discountAmount,
      total,
    };
  }

  // ===== Admin =====
  private async usageCounts(couponIds: string[]) {
    if (couponIds.length === 0) return new Map<string, number>();
    const rows = await this.prisma.couponRedemption.groupBy({
      by: ["couponId"],
      where: { couponId: { in: couponIds } },
      _count: { _all: true },
    });
    return new Map(rows.map((r) => [r.couponId, r._count._all]));
  }

  async getCoupons(query: GetCouponsQuery) {
    const { page, limit, search, status } = query;
    const now = new Date();
    const where: Prisma.CouponWhereInput = {
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
      ...(status === "active"
        ? { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] }
        : status === "inactive"
          ? { isActive: false }
          : status === "expired"
            ? { expiresAt: { lt: now } }
            : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        skip: (Math.max(page, 1) - 1) * limit,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.coupon.count({ where }),
    ]);
    const counts = await this.usageCounts(rows.map((r) => r.id));
    return {
      data: rows.map((c) => ({ ...c, usedCount: counts.get(c.id) ?? 0 })),
      total,
      page,
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  private async assertCoursesExist(courseIds: string[]) {
    if (!courseIds.length) return;
    const found = await this.prisma.course.count({ where: { id: { in: courseIds }, deletedAt: null } });
    if (found !== new Set(courseIds).size) throw new BadRequestException("Có khóa học áp dụng không tồn tại");
  }

  async createCoupon(body: CreateCouponBody, adminId: string) {
    if (await this.prisma.coupon.findUnique({ where: { code: body.code } })) {
      throw new ConflictException("Mã giảm giá đã tồn tại");
    }
    await this.assertCoursesExist(body.courseIds);
    return this.prisma.coupon.create({ data: { ...body, createdById: adminId } });
  }

  async updateCoupon(id: string, body: UpdateCouponBody) {
    if (!(await this.prisma.coupon.findUnique({ where: { id }, select: { id: true } }))) {
      throw new NotFoundException("Không tìm thấy mã giảm giá");
    }
    await this.assertCoursesExist(body.courseIds);
    return this.prisma.coupon.update({ where: { id }, data: body });
  }

  async deleteCoupon(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      select: { id: true, _count: { select: { orders: true } } },
    });
    if (!coupon) throw new NotFoundException("Không tìm thấy mã giảm giá");
    // Đơn (kể cả đã hủy) còn tham chiếu mã: giữ lại để không mất lịch sử
    if (coupon._count.orders > 0) {
      throw new ConflictException("Mã đã được dùng trong đơn hàng, hãy tắt kích hoạt thay vì xóa");
    }
    await this.prisma.coupon.delete({ where: { id } });
    return { success: true };
  }
}
