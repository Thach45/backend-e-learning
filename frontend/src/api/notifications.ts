import apiClient from './axios';

export type NotificationType =
  | 'SYSTEM'
  | 'COURSE_ENROLL'
  | 'NEW_COMMENT'
  | 'NEW_REPLY'
  | 'ORDER_STATUS'
  | 'LEARNING_PROGRESS';

export type NotificationItem = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: unknown;
  courseId?: string | null;
  lessonId?: string | null;
  orderId?: string | null;
  commentId?: string | null;
  status: 'UNREAD' | 'READ';
  readAt?: string | null;
  createdAt: string;
};

export type GetNotificationsParams = {
  page?: number;
  limit?: number;
  status?: 'UNREAD' | 'READ';
};

export type GetNotificationsResponse = {
  data: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const notificationsApi = {
  getMyNotifications: async (params?: GetNotificationsParams): Promise<GetNotificationsResponse> => {
    const response = await apiClient.get('/notifications', { params });
    return response.data.data;
  },

  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.data;
  },

  markAsRead: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data.data;
  },
};
