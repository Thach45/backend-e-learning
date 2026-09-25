import { Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { WishlistService } from "./wishlist.service";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import {
  GetWishlistQueryDto,
  GetWishlistParamsDto,
  GetWishlistResponseDto,
  GetWishlistListResponseDto,
  CheckWishlistResponseDto,
} from "./wishlist.dto";

@Controller("api")
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  // Client endpoints
  @Post("courses/:courseId/wishlist")
  @ZodSerializerDto(GetWishlistResponseDto)
  async addToWishlist(@Param() params: GetWishlistParamsDto, @ActiveUser() user: any) {
    return this.wishlistService.addToWishlist((params as any).courseId, user.userId);
  }

  @Delete("courses/:courseId/wishlist")
  async removeFromWishlist(@Param() params: GetWishlistParamsDto, @ActiveUser() user: any) {
    return this.wishlistService.removeFromWishlist((params as any).courseId, user.userId);
  }

  @Get("my-wishlist")
  @ZodSerializerDto(GetWishlistListResponseDto)
  async getMyWishlist(@Query() query: GetWishlistQueryDto, @ActiveUser() user: any) {
    return this.wishlistService.getWishlist(query as any, user.userId);
  }

  @Get("courses/:courseId/wishlist")
  @ZodSerializerDto(CheckWishlistResponseDto)
  async checkWishlist(@Param() params: GetWishlistParamsDto, @ActiveUser() user: any) {
    return this.wishlistService.checkWishlist((params as any).courseId, user.userId);
  }
}

