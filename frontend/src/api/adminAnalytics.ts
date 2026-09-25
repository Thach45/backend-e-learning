import { apiClient } from './axios';

export type AnalyticsOverview = {
  pendingReports: number;
  publishedCourses: number;
  pendingCourses: number;
  newUsers7d: number;
  activeLearners7d: number;
  totalComments: number;
  totalQuestions: number;
  unansweredQuestions: number;
  quizAttempts: number;
  quizPassRate: number;
  badgesAwarded: number;
  avgRating: number;
  reviewCount: number;
  avgSatisfaction: number;
  avgDifficulty: number;
  recommendRate: number;
  surveyCount: number;
};

export type CourseAnalyticsRow = {
  courseId: string;
  title: string;
  instructorName: string;
  enrollments: number;
  completedLearners: number;
  completionRate: number;
  avgRating: number;
  reviewCount: number;
  avgSatisfaction: number;
  avgDifficulty: number;
  recommendRate: number;
  surveyCount: number;
  quizAttempts: number;
  quizPassRate: number;
  questions: number;
  unansweredQuestions: number;
};

export type InstructorAnalyticsRow = {
  instructorId: string;
  name: string;
  email: string;
  courses: number;
  students: number;
  avgRating: number;
  reviewCount: number;
  followers: number;
};

export type AnalyticsListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
};

type Paged<T> = { data: T[]; total: number; page: number; limit: number; totalPages: number };

export type ExportResource =
  | 'users'
  | 'courses'
  | 'enrollments'
  | 'reviews'
  | 'audit-logs'
  | 'reports'
  | 'course-analytics'
  | 'instructor-analytics';

export const adminAnalyticsApi = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const response = await apiClient.get('/admin/analytics/overview');
    return response.data.data;
  },
  getCourses: async (params?: AnalyticsListParams): Promise<Paged<CourseAnalyticsRow>> => {
    const response = await apiClient.get('/admin/analytics/courses', { params });
    return response.data.data;
  },
  getInstructors: async (params?: AnalyticsListParams): Promise<Paged<InstructorAnalyticsRow>> => {
    const response = await apiClient.get('/admin/analytics/instructors', { params });
    return response.data.data;
  },

  // Tải CSV bằng axios (cần gửi kèm Authorization nên không dùng <a href> trực tiếp)
  exportCsv: async (resource: ExportResource, params?: Record<string, string | undefined>): Promise<void> => {
    const response = await apiClient.get(`/admin/export/${resource}`, { params, responseType: 'blob' });
    const url = URL.createObjectURL(response.data as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resource}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
