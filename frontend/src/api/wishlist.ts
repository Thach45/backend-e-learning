import apiClient from './axios';
import type { Course } from './courses';

// Types
export type WishlistItem = {
  id: string;
  userId: string;
  courseId: string;
  createdAt: string;
  course?: Course & {
    totalStars?: number;
    reviewsCount?: number;
    totalLearners?: number;
    totalLikes?: number;
  };
};

export type GetWishlistParams = {
  page?: number;
  limit?: number;
};

export type GetWishlistResponse = {
  data: WishlistItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Wishlist API functions
export const wishlistApi = {
  // Get my wishlist
  getMyWishlist: async (params?: GetWishlistParams): Promise<GetWishlistResponse> => {
    const response = await apiClient.get('/my-wishlist', { params });
    return response.data.data;
  },

  // Add to wishlist
  addToWishlist: async (courseId: string): Promise<WishlistItem> => {
    const response = await apiClient.post(`/courses/${courseId}/wishlist`);
    return response.data.data;
  },

  // Remove from wishlist
  removeFromWishlist: async (courseId: string): Promise<void> => {
    await apiClient.delete(`/courses/${courseId}/wishlist`);
  },

  // Check if in wishlist
  checkWishlist: async (courseId: string): Promise<{ isInWishlist: boolean }> => {
    const response = await apiClient.get(`/courses/${courseId}/wishlist`);
    return response.data.data;
  },
};

