import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartRepo } from './cart.repo';
import { PrismaService } from 'src/shared/service/prisma.service';

@Module({
  controllers: [CartController],
  providers: [CartService, CartRepo, PrismaService]
})
export class CartModule {}
