import { Injectable } from '@nestjs/common';
import { CartRepo } from './cart.repo';
import { AddToCartBodyDto, RemoveFromCartParamsDto } from './cart.dto';

@Injectable()
export class CartService {
    constructor(private readonly cartRepo: CartRepo) {}

    async getCart(userId: string) {
        const result = await this.cartRepo.getCart(userId);
        // If cart is null, return empty cart structure
        if (!result) {
            return {
                cart: null,
                subtotal: 0,
                total: 0,
                itemCount: 0,
            };
        }
        return result;
    }

    async addToCart(userId: string, body: AddToCartBodyDto) {
        return this.cartRepo.addToCart(userId, body.courseId);
    }

    async removeFromCart(userId: string, params: RemoveFromCartParamsDto) {
        return this.cartRepo.removeFromCart(userId, params.courseId);
    }

    async clearCart(userId: string) {
        return this.cartRepo.clearCart(userId);
    }
}
