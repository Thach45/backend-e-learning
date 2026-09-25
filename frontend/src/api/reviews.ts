import { apiClient } from './axios';

// Types
export type Review = {
  id: string;
  userId: string;
  courseId: string;
  rating: number; // 1-5
  comment?: string | null;
  instructorReply?: string | null;
  instructorReplyAt?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  course?: {
    id: string;
    title: string;
  };
};

export type GetReviewsParams = {
  page?: number;
  limit?: number;
  courseId?: string;
  userId?: string;
  rating?: number; // 1-5
};

export type GetReviewsResponse = {
  data: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateReviewBody = {
  rating: number; // 1-5
  comment?: string;
};

export type UpdateReviewBody = {
  rating?: number; // 1-5
  comment?: string | null;
};

// Reviews API functions
export const reviewsApi = {
  // Create review for a course
  createReview: async (courseId: string, body: CreateReviewBody): Promise<Review> => {
    const response = await apiClient.post(`/courses/${courseId}/reviews`, body);
    return response.data.data;
  },

  // Get reviews by course
  getReviewsByCourse: async (courseId: string, params?: Omit<GetReviewsParams, 'courseId'>): Promise<GetReviewsResponse> => {
    const response = await apiClient.get(`/courses/${courseId}/reviews`, { params });
    return response.data.data;
  },

  // Get my review for a course
  getMyReview: async (courseId: string): Promise<Review> => {
    const response = await apiClient.get(`/my-reviews/${courseId}`);
    return response.data.data;
  },

  // Instructor: Get reviews for their course
  getInstructorCourseReviews: async (courseId: string, params?: Omit<GetReviewsParams, 'courseId'>): Promise<GetReviewsResponse> => {
    const response = await apiClient.get(`/instructor/courses/${courseId}/reviews`, { params });
    return response.data.data;
  },

  // Instructor: Update review
  updateReview: async (courseId: string, reviewId: string, body: UpdateReviewBody): Promise<Review> => {
    const response = await apiClient.put(`/instructor/courses/${courseId}/reviews/${reviewId}`, body);
    return response.data.data;
  },

  // Instructor: Delete review
  deleteReview: async (courseId: string, reviewId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/instructor/courses/${courseId}/reviews/${reviewId}`);
    return response.data.data;
  },

  // Instructor: Reply to a review
  replyToReview: async (courseId: string, reviewId: string, reply: string): Promise<Review> => {
    const response = await apiClient.post(`/instructor/courses/${courseId}/reviews/${reviewId}/reply`, { reply });
    return response.data.data;
  },

  // Admin: Get all reviews
  getReviews: async (params?: GetReviewsParams): Promise<GetReviewsResponse> => {
    const response = await apiClient.get('/admin/reviews', { params });
    return response.data.data;
  },

  // Admin: Get reviews by course
  getAdminCourseReviews: async (courseId: string, params?: Omit<GetReviewsParams, 'courseId'>): Promise<GetReviewsResponse> => {
    const response = await apiClient.get(`/admin/courses/${courseId}/reviews`, { params });
    return response.data.data;
  },

  // Admin: Update review
  updateReviewAdmin: async (courseId: string, reviewId: string, body: UpdateReviewBody): Promise<Review> => {
    const response = await apiClient.put(`/admin/courses/${courseId}/reviews/${reviewId}`, body);
    return response.data.data;
  },

  // Admin: Delete review
  deleteReviewAdmin: async (courseId: string, reviewId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/admin/courses/${courseId}/reviews/${reviewId}`);
    return response.data.data;
  },
};
