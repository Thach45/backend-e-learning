import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepo } from './orders.repo';
import { PrismaService } from 'src/shared/service/prisma.service';
import { PaymentProviderFactory } from './payment.factory';
import { SepayPaymentProvider } from './sepay.provider';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepo, PrismaService, PaymentProviderFactory, SepayPaymentProvider]
})
export class OrdersModule {}
