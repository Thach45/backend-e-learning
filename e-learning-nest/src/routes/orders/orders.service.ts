import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { OrdersRepo, getPaymentTimeoutMs } from './orders.repo';
import { EXPIRE_JOB, ORDER_EXPIRY_QUEUE, expireJobId } from './order-expiry.constants';
import { AuditLogService } from 'src/shared/service/audit-log.service';
import { CreateOrderBody, GetOrdersQuery, UpdateOrderStatusBody } from './orders.model';
import { OrderStatus } from '@prisma/client';
import { PaymentProviderFactory } from './payment.factory';
import { SendEmailService } from 'src/shared/service/send-email.service';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        private readonly repo: OrdersRepo,
        private readonly paymentProviderFactory: PaymentProviderFactory,
        private readonly sendEmailService: SendEmailService,
        private readonly auditLogService: AuditLogService,
        @InjectQueue(ORDER_EXPIRY_QUEUE) private readonly expiryQueue: Queue,
    ) {}

    async createOrder(body: CreateOrderBody, userId: string) {
        const order = await this.repo.createOrder(userId, body);
        try {
            await this.sendEmailService.sendSuccessfulOrder({ 
                recipientEmail: order.user.email, 
                customerName: order.user.name,
                orderId: order.id,
                orderDate: order.createdAt.toISOString(),
                courses: order.orderItems.map((item) => ({
                    title: item.course.title,
                    price: item.price,
                    instructorName: item.course.instructor?.name,
                })),
                totalAmount: order.totalAmount,
                myCoursesUrl: `/checkout/payment/${order.id}`,
            });
        } catch (emailError) {
            this.logger.error(`Failed to send order created email: ${emailError.message}`);
        }

        if (order.totalAmount === 0) {
            // Mã giảm hết toàn bộ: cổng thanh toán coi đơn 0đ là đã thanh toán nên chốt luôn, không cần chờ tiền.
            const { order: paid, transitioned } = await this.repo.payOrder(order.id, userId);
            if (transitioned) await this.sendPaymentSuccessEmail(paid);
            return paid;
        }

        await this.scheduleExpiry(order.id, order.expiresAt);
        return order;
    }

    /** Hẹn giờ hủy đơn nếu quá hạn thanh toán. Lỗi Redis không được làm hỏng việc tạo đơn (job quét sẽ bù). */
    private async scheduleExpiry(orderId: string, expiresAt?: Date | null) {
        const delay = Math.max((expiresAt?.getTime() ?? Date.now() + getPaymentTimeoutMs()) - Date.now(), 0);
        try {
            await this.expiryQueue.add(
                EXPIRE_JOB,
                { orderId },
                {
                    jobId: expireJobId(orderId),
                    delay,
                    removeOnComplete: true,
                    removeOnFail: 100,
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 5000 },
                },
            );
        } catch (error) {
            this.logger.error(`Không hẹn được giờ hủy cho đơn ${orderId}, chờ job quét xử lý: ${error}`);
        }
    }

    /** Xóa job hẹn giờ của đơn (đơn đã thanh toán hoặc đã bị hủy). */
    async cancelExpiryJob(orderId: string) {
        try {
            await this.expiryQueue.remove(expireJobId(orderId));
        } catch (error) {
            this.logger.warn(`Không xóa được job hẹn giờ của đơn ${orderId}: ${error}`);
        }
    }

    /**
     * Hủy một đơn chưa thanh toán và trả lượt coupon. Trả về false nếu đơn không còn PENDING.
     * Mọi đường hủy (hết hạn, admin đổi FAILED) đều đi qua đây.
     */
    async failOrder(orderId: string, reason: 'expired' | 'admin'): Promise<boolean> {
        const failed = await this.repo.failPendingOrder(orderId);
        if (failed) {
            await this.cancelExpiryJob(orderId);
            await this.auditLogService.log({
                action: reason === 'expired' ? 'order.expired' : 'order.failed_by_admin',
                targetType: 'Order',
                targetId: orderId,
            });
        }
        return failed;
    }

    /** Hủy các đơn PENDING đã quá hạn (dùng cho job quét). Trả về số đơn đã hủy. */
    async expireOverdueOrders(): Promise<number> {
        let count = 0;
        for (const id of await this.repo.findOverduePendingOrderIds()) {
            if (await this.failOrder(id, 'expired')) count++;
        }
        return count;
    }
    async getQrCode(orderId: string, userId: string) {
        const order = await this.repo.getOrderById(orderId, userId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const provider = this.paymentProviderFactory.getProvider();
        return provider.getQrCode({ id: order.id, totalAmount: order.totalAmount });
    }

    async getOrders(query: GetOrdersQuery, userId?: string) {

        return this.repo.getOrders(query, userId);
    }

    async getOrderById(orderId: string, userId?: string) {
        return this.repo.getOrderById(orderId, userId);
    }

    async payOrder(orderId: string, userId: string) {
        const order = await this.repo.getOrderById(orderId, userId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        // Webhook có thể đã chốt đơn trước: trả về đơn như một lần thành công (idempotent).
        if (order.status === OrderStatus.PAID) {
            return order;
        }
        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException('Order is not pending');
        }

        const provider = this.paymentProviderFactory.getProvider();
        const result = await provider.checkPayment({ id: order.id, totalAmount: order.totalAmount });

        if (!result.paid) {
            throw new BadRequestException(
                result.reason || 'Payment not found. Please check your transaction or try again later.',
            );
        }

        const { order: updatedOrder, transitioned } = await this.repo.payOrder(orderId, userId);
        // Chỉ bên nào thật sự chốt đơn mới gửi email, tránh gửi trùng khi chạy song song với webhook.
        if (transitioned) {
            await this.cancelExpiryJob(orderId);
            await this.sendPaymentSuccessEmail(updatedOrder);
        }
        return updatedOrder;
    }

    /** Gửi email thanh toán thành công (không làm hỏng luồng chính nếu gửi lỗi). */
    async sendPaymentSuccessEmail(order: Awaited<ReturnType<OrdersRepo['getOrderById']>>) {
        try {
            await this.sendEmailService.sendSuccessfulPayment({
                recipientEmail: order.user.email,
                customerName: order.user.name,
                orderId: order.id,
                orderDate: new Date().toISOString(),
                paymentMethod: 'Chuyển khoản Ngân hàng (VietQR)',
                courses: order.orderItems.map((item) => ({
                    title: item.course.title,
                    price: item.price,
                    instructorName: item.course.instructor?.name,
                })),
                totalAmount: order.totalAmount,
                myCoursesUrl: '/my-courses',
            });
        } catch (emailError) {
            this.logger.error(`Failed to send successful payment email: ${emailError.message}`);
        }
    }

    async updateOrderStatus(orderId: string, body: UpdateOrderStatusBody, userId?: string) {
        // Admin đặt FAILED cho đơn đang chờ: đi đường hủy chung để lượt coupon được trả lại
        if (body.status === OrderStatus.FAILED && !userId && (await this.failOrder(orderId, 'admin'))) {
            return this.repo.getOrderById(orderId);
        }
        return this.repo.updateOrderStatus(orderId, body.status as OrderStatus, userId);
    }
}
