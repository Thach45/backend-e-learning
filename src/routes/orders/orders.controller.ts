import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';
import { OrdersService } from './orders.service';
import {
  CreateOrderBodyDto,
  GetOrdersQueryDto,
  GetOrderParamsDto,
  UpdateOrderStatusBodyDto,
  PayOrderBodyDto,
  GetOrderResponseDto,
  GetOrdersResponseDto,
} from './orders.dto';

@Controller('api')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    // Client endpoints
    @Post('orders')
    @ZodSerializerDto(GetOrderResponseDto)
    async createOrder(@ActiveUser() user: any, @Body() body: CreateOrderBodyDto) {
        return this.ordersService.createOrder(body as any, user.userId);
    }

    @Get('my-orders')
    @ZodSerializerDto(GetOrdersResponseDto)
    async getMyOrders(@Query() query: GetOrdersQueryDto, @ActiveUser() user: any) {
        return this.ordersService.getOrders(query as any, user.userId);
    }

    @Get('my-orders/:orderId')
    @ZodSerializerDto(GetOrderResponseDto)
    async getMyOrderById(@Param() params: GetOrderParamsDto, @ActiveUser() user: any) {
        return this.ordersService.getOrderById((params as any).orderId, user.userId);
    }
    @Get('orders/:orderId/qr-code')
    async getQrCode(@Param() params: GetOrderParamsDto, @ActiveUser() user: any) {
        const result = await this.ordersService.getQrCode((params as any).orderId, user.userId);
        return { data: result };
    }
    @Post('orders/:orderId/check-payment')
    @ZodSerializerDto(GetOrderResponseDto)
    async payOrder(@Param() params: GetOrderParamsDto, @Body() body: PayOrderBodyDto, @ActiveUser() user: any) {
        return this.ordersService.payOrder((params as any).orderId, user.userId);
    }

    // Admin endpoints
    @Get('admin/orders')
    @ZodSerializerDto(GetOrdersResponseDto)
    async getOrdersAdmin(@Query() query: GetOrdersQueryDto) {
        return this.ordersService.getOrders(query as any);
    }

    @Get('admin/orders/:orderId')
    @ZodSerializerDto(GetOrderResponseDto)
    async getOrderByIdAdmin(@Param() params: GetOrderParamsDto) {
        return this.ordersService.getOrderById((params as any).orderId);
    }

    @Put('admin/orders/:orderId/status')
    @ZodSerializerDto(GetOrderResponseDto)
    async updateOrderStatus(@Param() params: GetOrderParamsDto, @Body() body: UpdateOrderStatusBodyDto) {
        return this.ordersService.updateOrderStatus((params as any).orderId, body as any);
    }
    
}
