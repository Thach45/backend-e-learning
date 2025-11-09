import { Injectable } from "@nestjs/common";
import { WishlistRepository } from "./wishlist.repo";
import { GetWishlistQuery } from "./wishlist.model";

@Injectable()
export class WishlistService {
  constructor(private readonly wishlistRepo: WishlistRepository) {}

  async getWishlist(query: GetWishlistQuery, userId: string) {
    return this.wishlistRepo.getWishlist(query, userId);
  }

  async addToWishlist(courseId: string, userId: string) {
    return this.wishlistRepo.addToWishlist(courseId, userId);
  }

  async removeFromWishlist(courseId: string, userId: string) {
    return this.wishlistRepo.removeFromWishlist(courseId, userId);
  }

  async checkWishlist(courseId: string, userId: string) {
    return this.wishlistRepo.checkWishlist(courseId, userId);
  }

  async getWishlistByCourseId(courseId: string, userId: string) {
    return this.wishlistRepo.getWishlistByCourseId(courseId, userId);
  }
}

