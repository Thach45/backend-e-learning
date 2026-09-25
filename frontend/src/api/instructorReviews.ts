import apiClient from './axios';

// Types
export type InstructorReview = {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
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

export type GetInstructorReviewsParams = {
  page?: number;
  limit?: number;
  courseId?: string;
  rating?: number;
};

export type GetInstructorReviewsResponse = {
  data: InstructorReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type UpdateReviewBody = {
  rating?: number;
  comment?: string | null;
};

// Instructor Reviews API functions
export const instructorReviewsApi = {
  // Get reviews by course
  getReviewsByCourse: async (courseId: string, params?: GetInstructorReviewsParams): Promise<GetInstructorReviewsResponse> => {
    const response = await apiClient.get(`/instructor/courses/${courseId}/reviews`, { params });
    return response.data.data;
  },

  // Update review
  updateReview: async (courseId: string, reviewId: string, body: UpdateReviewBody): Promise<InstructorReview> => {
    const response = await apiClient.put(`/instructor/courses/${courseId}/reviews/${reviewId}`, body);
    return response.data.data;
  },

  // Delete review
  deleteReview: async (courseId: string, reviewId: string): Promise<void> => {
    await apiClient.delete(`/instructor/courses/${courseId}/reviews/${reviewId}`);
  },

  // Reply to review
  replyToReview: async (courseId: string, reviewId: string, reply: string): Promise<InstructorReview> => {
    const response = await apiClient.post(`/instructor/courses/${courseId}/reviews/${reviewId}/reply`, { reply });
    return response.data.data;
  },
};

