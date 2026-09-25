import apiClient from './axios';

// Types
export type Course = {
  id: string;
  title: string;
  price: number;
  salePrice?: number;
  thumbnail?: string;
  introVideo?: string;
  isFeatured: boolean;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  language?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PENDING_PUBLISHED' | 'PENDING_DRAFT';
  instructorId: string;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
  instructor?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  totalStars?: number;
  reviewsCount?: number;
  totalLearners?: number;
  totalLikes?: number;
  totalLessons?: number;
  totalDuration?: number; // in seconds
};

export type CourseDetail = {
  id: string;
  courseId: string;
  description?: string;
  content?: string;
  objectives?: string;
  requirements?: string;
  targetAudience?: string;
  benefits?: string;
  relatedCourses: string[];
};

export type CourseWithDetail = Course & {
  courseDetail?: CourseDetail;
};

export type CourseListParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status?: string;
  isFeatured?: boolean;
};

export type CourseListResponse = {
  data: CourseWithDetail[];
  total: number;
  page: number;
  limit: number;
};

// Course detail response type (matches backend GetCourseResponseSchema)
export type GetCourseDetailResponse = {
  id: string;
  title: string;
  price: number;
  salePrice?: number | null;
  originalPrice?: number;
  thumbnail?: string | null;
  introVideo?: string | null;
  isFeatured: boolean;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  language: string;
  tags: Array<{ id: string; name: string; slug: string }>;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PENDING_PUBLISHED' | 'PENDING_DRAFT';
  updatedAt: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string | null;
    bio?: string | null;
    rating?: number;
    students?: number;
    courses?: number;
  };
  category?: {
    id?: string;
    name: string;
  } | null;
  detail?: {
    description?: string | null;
    objectives?: string | null;
    benefits?: string | null;
    requirements?: string | null;
    targetAudience?: string | null;
  } | null;
  content: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
      type: string;
      duration?: string | null;
      isPreview?: boolean;
    }>;
  }>;
  stats: {
    videoLessons: number;
    textLessons: number;
    quizzes: number;
    materials: number;
  };
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  totalLessons: number;
  totalDuration: string;
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  totalWishlist?: number;
};

export type PublicPreviewLesson = {
  id: string;
  title: string;
  storageType: string;
  storageUrl?: string | null;
  contentText?: string | null;
  duration?: number | null;
};

// Courses API functions
export const coursesApi = {
  // Get all courses
  getCourses: async (params?: CourseListParams): Promise<CourseListResponse> => {
    const response = await apiClient.get('/courses', { params });
    return response.data.data;
  },

  // Get course by ID (full detail)
  getCourseById: async (id: string): Promise<GetCourseDetailResponse> => {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data.data;
  },

  // Create course (Instructor)
  createCourse: async (body: Partial<Course>): Promise<Course> => {
    const response = await apiClient.post('/courses', body);
    return response.data.data;
  },

  // Update course (Instructor)
  updateCourse: async (id: string, body: Partial<Course>): Promise<Course> => {
    const response = await apiClient.put(`/courses/${id}`, body);
    return response.data.data;
  },

  // Delete course (Instructor/Admin)
  deleteCourse: async (id: string): Promise<void> => {
    await apiClient.delete(`/courses/${id}`);
  },

  // Bài học xem thử công khai (chỉ khi giảng viên bật isPreview)
  getPreviewLesson: async (lessonId: string): Promise<PublicPreviewLesson> => {
    const response = await apiClient.get(`/lessons/${lessonId}/preview`);
    return response.data.data;
  },

  // Get related courses (same category, falling back to same instructor / featured)
  getRelatedCourses: async (id: string, limit = 6): Promise<Course[]> => {
    const response = await apiClient.get(`/courses/${id}/related`, { params: { limit } });
    return response.data.data;
  },
};

