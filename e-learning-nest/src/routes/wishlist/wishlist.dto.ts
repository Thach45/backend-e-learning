import { createZodDto } from "nestjs-zod";
import {
  GetWishlistQuerySchema,
  GetWishlistParamsSchema,
  GetWishlistResponseSchema,
  GetWishlistListResponseSchema,
  CheckWishlistResponseSchema,
} from "./wishlist.model";

export class GetWishlistQueryDto extends createZodDto(GetWishlistQuerySchema) {}
export class GetWishlistParamsDto extends createZodDto(GetWishlistParamsSchema) {}
export class GetWishlistResponseDto extends createZodDto(GetWishlistResponseSchema) {}
export class GetWishlistListResponseDto extends createZodDto(GetWishlistListResponseSchema) {}
export class CheckWishlistResponseDto extends createZodDto(CheckWishlistResponseSchema) {}

