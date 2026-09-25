import apiClient from './axios';
import type { CourseWithDetail } from './courses';

// Types
export type InstructorStats = {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRating: number;
  totalStudents: number;
  totalReviews: number;
};

export type CourseAnalytics = {
  courseId: string;
  title: string;
  enrollments: number;
  revenue: number;
  views: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
};

export type RevenueChartDataPoint = {
  date: string;
  revenue: number;
  enrollments: number;
};

export type RevenueChartData = {
  data: RevenueChartDataPoint[];
};

export type EnrolledStudent = {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progress?: number;
  completedAt?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  course: {
    id: string;
    title: string;
  };
};

export type GetEnrolledStudentsParams = {
  page?: number;
  limit?: number;
  courseId?: string;
  search?: string;
};

export type GetEnrolledStudentsResponse = {
  data: EnrolledStudent[];
  total?: number;
  totalItems?: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Instructor Courses Types - dùng CourseWithDetail từ courses
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PENDING_PUBLISHED' | 'PENDING_DRAFT';

export type GetInstructorCoursesParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PENDING_PUBLISHED' | 'PENDING_DRAFT';
  isFeatured?: boolean;
};

export type GetInstructorCoursesResponse = {
  data: CourseWithDetail[];
  total: number;
  page: number;
  limit: number;
};

export type CreateCourseBody = {
  title: string;
  price?: number;
  salePrice?: number;
  thumbnail?: string;
  introVideo?: string;
  isFeatured?: boolean;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PENDING_PUBLISHED' | 'PENDING_DRAFT';
  categoryId?: string;
};

export type UpdateCourseBody = {
  title?: string;
  price?: number;
  salePrice?: number | null;
  thumbnail?: string | null;
  introVideo?: string | null;
  isFeatured?: boolean;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  categoryId?: string | null;
};

// API functions
export const instructorApi = {
  getStats: async (): Promise<InstructorStats> => {
    const response = await apiClient.get('/instructor/dashboard/stats');
    return response.data.data || response.data;
  },

  getCourseAnalytics: async (): Promise<{ data: CourseAnalytics[] }> => {
    const response = await apiClient.get('/instructor/analytics/courses');
    return response.data.data || response.data;
  },

  getRevenueChartData: async (params?: { days?: number; startDate?: string; endDate?: string }): Promise<RevenueChartData> => {
    const response = await apiClient.get('/instructor/revenue/chart', {
      params: params || { days: 30 },
    });
    return response.data.data || response.data;
  },

  getEnrolledStudents: async (params?: GetEnrolledStudentsParams): Promise<GetEnrolledStudentsResponse> => {
    const response = await apiClient.get('/instructor/students', { params });
    return response.data.data || response.data;
  },

  getCourseDropoffAnalytics: async (courseId: string): Promise<CourseDropoffAnalytics> => {
    const response = await apiClient.get(`/instructor/courses/${courseId}/analytics/dropoff`);
    return response.data.data;
  },

  getCoursePreviewContents: async (courseId: string): Promise<CoursePreviewContents> => {
    const response = await apiClient.get(`/instructor/courses/${courseId}/preview/contents`);
    return response.data.data;
  },

  getPreviewLessonDetail: async (courseId: string, lessonId: string): Promise<PreviewLessonDetail> => {
    const response = await apiClient.get(`/instructor/courses/${courseId}/preview/lessons/${lessonId}`);
    return response.data.data;
  },
};

// Drop-off analytics
export type LessonDropoff = {
  lessonId: string;
  lessonTitle: string;
  reached: number;
  completed: number;
  reachRate: number;
  completionRate: number;
  dropoffRate: number;
};

export type CourseDropoffAnalytics = {
  courseId: string;
  totalEnrollments: number;
  lessons: LessonDropoff[];
};

// Student-view preview
export type PreviewLesson = {
  id: string;
  title: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'GAME';
  duration: string;
  isLocked: boolean;
};

export type PreviewSection = {
  id: string;
  title: string;
  orderIndex: number;
  duration: string;
  lessons: PreviewLesson[];
};

export type CoursePreviewContents = {
  courseId: string;
  courseTitle: string;
  thumbnailUrl?: string | null;
  contents: PreviewSection[];
};

export type PreviewLessonDetail = {
  id: string;
  title: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'GAME';
  storageType: string;
  storageUrl?: string | null;
  contentText?: string | null;
  transcript?: string | null;
  duration?: number | null;
  description?: string | null;
  resources?: Array<{ name: string; url: string; type: string }>;
};

// Instructor Courses API
export const instructorCoursesApi = {
  getCourses: async (params?: GetInstructorCoursesParams): Promise<GetInstructorCoursesResponse> => {
    const response = await apiClient.get('/instructor/courses', { params });
    return response.data.data || response.data;
  },

  getCourseById: async (id: string): Promise<CourseWithDetail> => {
    const response = await apiClient.get(`/instructor/courses/${id}`);
    return response.data.data || response.data;
  },

  createCourse: async (body: CreateCourseBody): Promise<CourseWithDetail> => {
    const response = await apiClient.post('/instructor/courses', body);
    return response.data.data || response.data;
  },

  updateCourse: async (id: string, body: UpdateCourseBody): Promise<CourseWithDetail> => {
    const response = await apiClient.put(`/instructor/courses/${id}`, body);
    return response.data.data || response.data;
  },

  deleteCourse: async (id: string): Promise<void> => {
    await apiClient.delete(`/instructor/courses/${id}`);
  },

  requestApproval: async (id: string): Promise<CourseWithDetail> => {
    const response = await apiClient.post(`/instructor/courses/${id}/request-approval`);
    return response.data.data || response.data;
  },

  requestDelete: async (id: string): Promise<CourseWithDetail> => {
    const response = await apiClient.post(`/instructor/courses/${id}/request-delete`);
    return response.data.data || response.data;
  },
};
