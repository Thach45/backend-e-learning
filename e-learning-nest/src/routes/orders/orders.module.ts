import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepo } from './orders.repo';
import { PrismaService } from 'src/shared/service/prisma.service';
import { PaymentProviderFactory } from './payment.factory';
import { SepayPaymentProvider } from './sepay.provider';
import { SharedModule } from 'src/shared/shared.module';
import { PaymentWebhookController } from './payment-webhook.controller';
import { PaymentWebhookService } from './payment-webhook.service';
import { CouponsModule } from '../coupons/coupons.module';
import { ORDER_EXPIRY_QUEUE } from './order-expiry.constants';
import { OrderExpiryProcessor } from './order-expiry.processor';
import { OrderExpirySweeper } from './order-expiry.sweeper';

@Module({
  imports: [SharedModule, CouponsModule, BullModule.registerQueue({ name: ORDER_EXPIRY_QUEUE })],
  controllers: [OrdersController, PaymentWebhookController],
  providers: [OrdersService, OrdersRepo, PaymentWebhookService, OrderExpiryProcessor, OrderExpirySweeper, PrismaService, PaymentProviderFactory, SepayPaymentProvider]
})
export class OrdersModule {}
