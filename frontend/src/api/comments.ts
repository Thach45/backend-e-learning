import { apiClient } from './axios';

// Types
export type Comment = {
  id: string;
  userId: string;
  lessonId: string;
  content: string;
  parentId?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  lesson?: {
    id: string;
    title: string;
  };
  parent?: Comment | null;
  replies?: Comment[];
  reactionCounts?: { LIKE: number; LOVE: number; HELPFUL: number };
  myReaction?: ReactionType | null;
};

export type ReactionType = 'LIKE' | 'LOVE' | 'HELPFUL';

export type GetCommentsParams = {
  page?: number;
  limit?: number;
  lessonId?: string;
  userId?: string;
  parentId?: string | null; // null = top-level, uuid = replies of that comment
};

export type GetCommentsResponse = {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateCommentBody = {
  content: string;
  parentId?: string | null; // Optional: null = top-level, uuid = reply to that comment
};

export type UpdateCommentBody = {
  content: string;
};

// Comments API functions
export const commentsApi = {
  // Create comment for a lesson
  createComment: async (lessonId: string, body: CreateCommentBody): Promise<Comment> => {
    const response = await apiClient.post(`/lessons/${lessonId}/comments`, body);
    return response.data.data;
  },

  // Get comments by lesson
  getCommentsByLesson: async (lessonId: string, params?: Omit<GetCommentsParams, 'lessonId'>): Promise<GetCommentsResponse> => {
    const response = await apiClient.get(`/lessons/${lessonId}/comments`, { params });
    return response.data.data;
  },

  // Get comment by ID
  getCommentById: async (lessonId: string, commentId: string): Promise<Comment> => {
    const response = await apiClient.get(`/lessons/${lessonId}/comments/${commentId}`);
    return response.data.data;
  },

  // Update comment
  updateComment: async (lessonId: string, commentId: string, body: UpdateCommentBody): Promise<Comment> => {
    const response = await apiClient.put(`/lessons/${lessonId}/comments/${commentId}`, body);
    return response.data.data;
  },

  // Delete comment
  deleteComment: async (lessonId: string, commentId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/lessons/${lessonId}/comments/${commentId}`);
    return response.data.data;
  },

  // Admin: Get all comments
  getComments: async (params?: GetCommentsParams): Promise<GetCommentsResponse> => {
    const response = await apiClient.get('/admin/comments', { params });
    return response.data.data;
  },

  // Admin: Update comment
  updateCommentAdmin: async (lessonId: string, commentId: string, body: UpdateCommentBody): Promise<Comment> => {
    const response = await apiClient.put(`/admin/lessons/${lessonId}/comments/${commentId}`, body);
    return response.data.data;
  },

  // Admin: Delete comment
  deleteCommentAdmin: async (lessonId: string, commentId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/admin/lessons/${lessonId}/comments/${commentId}`);
    return response.data.data;
  },

  // Toggle reaction on a comment
  toggleReaction: async (
    commentId: string,
    type: ReactionType,
  ): Promise<{ reactionCounts: { LIKE: number; LOVE: number; HELPFUL: number }; myReaction: ReactionType | null }> => {
    const response = await apiClient.post(`/comments/${commentId}/reactions`, { type });
    return response.data.data;
  },
};


