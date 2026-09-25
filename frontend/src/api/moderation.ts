import { apiClient } from './axios';

export type ReportTargetType = 'COMMENT' | 'LESSON_QUESTION' | 'LESSON_ANSWER' | 'REVIEW';
export type ReportReason = 'SPAM' | 'INAPPROPRIATE' | 'HARASSMENT' | 'MISLEADING' | 'OTHER';
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  SPAM: 'Spam / quảng cáo',
  INAPPROPRIATE: 'Nội dung không phù hợp',
  HARASSMENT: 'Quấy rối / xúc phạm',
  MISLEADING: 'Sai lệch / gây hiểu nhầm',
  OTHER: 'Lý do khác',
};

export const REPORT_TARGET_LABELS: Record<ReportTargetType, string> = {
  COMMENT: 'Bình luận',
  LESSON_QUESTION: 'Câu hỏi',
  LESSON_ANSWER: 'Câu trả lời',
  REVIEW: 'Đánh giá',
};

type PersonLite = { id: string; name: string; email: string; avatar?: string | null };

export type ContentReport = {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string | null;
  contentSnapshot?: string | null;
  targetContext?: string | null;
  status: ReportStatus;
  contentRemoved: boolean;
  resolutionNote?: string | null;
  handledAt?: string | null;
  createdAt: string;
  reporter: PersonLite;
  handledBy?: { id: string; name: string } | null;
  targetAuthor: PersonLite | null;
  targetExists: boolean;
  reportCount: number;
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ModerationComment = {
  id: string;
  content: string;
  parentId?: string | null;
  createdAt: string;
  user: PersonLite;
  context: string;
  _count: { replies: number; reactions: number };
};

export type ModerationAnswer = {
  id: string;
  content: string;
  isInstructorAnswer: boolean;
  createdAt: string;
  user: PersonLite;
};

export type ModerationQuestion = {
  id: string;
  title: string;
  content: string;
  isResolved: boolean;
  createdAt: string;
  user: PersonLite;
  context: string;
  answers: ModerationAnswer[];
};

export type GetReportsParams = {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  targetType?: ReportTargetType;
};

export type ModerationListParams = {
  page?: number;
  limit?: number;
  search?: string;
  resolved?: 'true' | 'false';
};

export const moderationApi = {
  // Client
  createReport: async (body: {
    targetType: ReportTargetType;
    targetId: string;
    reason: ReportReason;
    details?: string;
  }): Promise<void> => {
    await apiClient.post('/reports', body);
  },

  // Admin
  getReports: async (params?: GetReportsParams): Promise<Paginated<ContentReport>> => {
    const response = await apiClient.get('/admin/reports', { params });
    return response.data.data;
  },
  getPendingCount: async (): Promise<{ pending: number }> => {
    const response = await apiClient.get('/admin/reports/pending-count');
    return response.data.data;
  },
  resolveReport: async (
    id: string,
    body: { action: 'REMOVE_CONTENT' | 'DISMISS'; note?: string },
  ): Promise<{ success: boolean; contentRemoved: boolean; reportsClosed: number }> => {
    const response = await apiClient.put(`/admin/reports/${id}/resolve`, body);
    return response.data.data;
  },
  getComments: async (params?: ModerationListParams): Promise<Paginated<ModerationComment>> => {
    const response = await apiClient.get('/admin/moderation/comments', { params });
    return response.data.data;
  },
  deleteComment: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/moderation/comments/${id}`);
  },
  getQuestions: async (params?: ModerationListParams): Promise<Paginated<ModerationQuestion>> => {
    const response = await apiClient.get('/admin/moderation/questions', { params });
    return response.data.data;
  },
  deleteQuestion: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/moderation/questions/${id}`);
  },
  deleteAnswer: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/moderation/answers/${id}`);
  },
};
