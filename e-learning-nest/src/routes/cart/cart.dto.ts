import { createZodDto } from "nestjs-zod";
import {
  CartItemSchema,
  CartSchema,
  GetCartResponseSchema,
  AddToCartBodySchema,
  RemoveFromCartParamsSchema,
  MergeCartBodySchema,
} from "./cart.model";

export class CartItemDto extends createZodDto(CartItemSchema) {}
export class CartDto extends createZodDto(CartSchema) {}
export class GetCartResponseDto extends createZodDto(GetCartResponseSchema) {}
export class AddToCartBodyDto extends createZodDto(AddToCartBodySchema) {}
export class RemoveFromCartParamsDto extends createZodDto(RemoveFromCartParamsSchema) {}
export class MergeCartBodyDto extends createZodDto(MergeCartBodySchema) {}

