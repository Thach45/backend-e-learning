import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepo } from './orders.repo';
import { CreateOrderBody, GetOrdersQuery, UpdateOrderStatusBody } from './orders.model';
import { OrderStatus } from '@prisma/client';
import { PaymentProviderFactory } from './payment.factory';
import { SendEmailService } from 'src/shared/service/send-email.service';

@Injectable()
export class OrdersService {
    constructor(
        private readonly repo: OrdersRepo,
        private readonly paymentProviderFactory: PaymentProviderFactory,
        private readonly sendEmailService: SendEmailService,
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
            console.error('Failed to send order created email:', emailError.message);
        }
        return order;
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

        const updatedOrder = await this.repo.payOrder(orderId, userId);

        try {
            await this.sendEmailService.sendSuccessfulPayment({
                recipientEmail: updatedOrder.user.email,
                customerName: updatedOrder.user.name,
                orderId: updatedOrder.id,
                orderDate: new Date().toISOString(),
                paymentMethod: 'Chuyển khoản Ngân hàng (VietQR)',
                courses: updatedOrder.orderItems.map((item) => ({
                    title: item.course.title,
                    price: item.price,
                    instructorName: item.course.instructor?.name,
                })),
                totalAmount: updatedOrder.totalAmount,
                myCoursesUrl: '/my-courses',
            });
        } catch (emailError) {
            console.error('Failed to send successful payment email:', emailError.message);
        }

        return updatedOrder;
    }

    async updateOrderStatus(orderId: string, body: UpdateOrderStatusBody, userId?: string) {
        return this.repo.updateOrderStatus(orderId, body.status as OrderStatus, userId);
    }
}
