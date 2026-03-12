import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepo } from './orders.repo';
import { CreateOrderBody, GetOrdersQuery, UpdateOrderStatusBody } from './orders.model';
import { OrderStatus } from '@prisma/client';
import { PaymentProviderFactory } from './payment.factory';

@Injectable()
export class OrdersService {
    constructor(
        private readonly repo: OrdersRepo,
        private readonly paymentProviderFactory: PaymentProviderFactory,
    ) {}

    async createOrder(body: CreateOrderBody, userId: string) {
        return this.repo.createOrder(userId, body);
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

        return this.repo.payOrder(orderId, userId);
    }

    async updateOrderStatus(orderId: string, body: UpdateOrderStatusBody, userId?: string) {
        return this.repo.updateOrderStatus(orderId, body.status as OrderStatus, userId);
    }
}
