import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepo } from './orders.repo';
import { PrismaService } from 'src/shared/service/prisma.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepo, PrismaService]
})
export class OrdersModule {}
