import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';
import { CartService } from './cart.service';
import { AddToCartBodyDto, GetCartResponseDto, RemoveFromCartParamsDto } from './cart.dto';

@Controller('api/cart')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Get()
    // @ZodSerializerDto(GetCartResponseDto)
    async getCart(@ActiveUser() user: any) {
        console.log('getCart', user.userId);
        return this.cartService.getCart(user.userId);
    }

    @Post('/items')
    @ZodSerializerDto(GetCartResponseDto)
    async addToCart(@ActiveUser() user: any, @Body() body: AddToCartBodyDto) {
        return this.cartService.addToCart(user.userId, body);
    }

    @Delete('/items/:courseId')
    @ZodSerializerDto(GetCartResponseDto)
    async removeFromCart(@ActiveUser() user: any, @Param() params: RemoveFromCartParamsDto) {
        return this.cartService.removeFromCart(user.userId, params);
    }

    @Delete()
    async clearCart(@ActiveUser() user: any) {
        return this.cartService.clearCart(user.userId);
    }
}
