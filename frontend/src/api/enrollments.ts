import apiClient from './axios';

// Types
export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string | null;
  course?: {
    id: string;
    title: string;
    thumbnail?: string | null;
    price: number;
    salePrice?: number | null;
    instructor?: {
      id: string;
      name: string;
    };
  };
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
};

export type EnrollmentStats = {
  totalCourses: number;
  completedCourses: number;
  certificates: number;
  learningHours: number;
};

export type GetEnrollmentsParams = {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
  completed?: boolean;
};

export type GetEnrollmentsResponse = {
  data: Enrollment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ContinueWatchingItem = {
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string | null;
  lessonId: string;
  lessonTitle: string;
  progressPercent: number;
  lastAccessed: string;
};

// Enrollments API functions
export const enrollmentsApi = {
  // Get my enrollments
  getMyEnrollments: async (params?: GetEnrollmentsParams): Promise<GetEnrollmentsResponse> => {
    const response = await apiClient.get('/my-enrollments', { params });
    return response.data.data;
  },

  // Get enrollment stats
  getMyEnrollmentStats: async (): Promise<EnrollmentStats> => {
    const response = await apiClient.get('/my-enrollments/stats');
    return response.data.data;
  },

  // Get "continue watching" - most recent in-progress lessons
  getContinueWatching: async (): Promise<{ data: ContinueWatchingItem[] }> => {
    const response = await apiClient.get('/my-enrollments/continue-watching');
    return response.data.data;
  },

  // Enroll in course
  enrollInCourse: async (courseId: string): Promise<Enrollment> => {
    const response = await apiClient.post(`/courses/${courseId}/enroll`);
    return response.data.data;
  },

  // Complete course
  completeCourse: async (courseId: string): Promise<Enrollment> => {
    const response = await apiClient.put(`/my-enrollments/${courseId}/complete`);
    return response.data.data;
  },

  // Get my enrollment for a specific course
  getEnrollmentByCourseId: async (courseId: string): Promise<Enrollment> => {
    const response = await apiClient.get(`/my-enrollments/${courseId}`);
    return response.data.data;
  },

  // Get course contents for enrolled user
  getCourseContents: async (courseId: string): Promise<GetCourseContentsResponse> => {
    const response = await apiClient.get(`/my-enrollments/${courseId}/contents`);
    return response.data.data;
  },

  // Get lesson detail for enrolled user
  getLessonDetail: async (courseId: string, lessonId: string): Promise<LessonDetail> => {
    const response = await apiClient.get(`/my-enrollments/${courseId}/lessons/${lessonId}`);
    return response.data.data;
  },

  // Update lesson watch progress
  updateLessonProgress: async (
    courseId: string,
    lessonId: string,
    progressPercent: number,
  ): Promise<{ courseId: string; lessonId: string; progressPercent: number; lastAccessed: string }> => {
    const response = await apiClient.put(`/my-enrollments/${courseId}/lessons/${lessonId}/progress`, {
      progressPercent,
    });
    return response.data.data;
  },
};

// Course Contents Types
export type CourseContentSection = {
  id: string;
  title: string;
  orderIndex: number;
  duration?: string;
  lessons: LessonItem[];
};

export type LessonItem = {
  id: string;
  title: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'GAME';
  duration?: string;
  isLocked?: boolean;
};

export type GetCourseContentsResponse = {
  courseId: string;
  courseTitle: string;
  thumbnailUrl?: string | null;
  contents: CourseContentSection[];
};

// Lesson Detail Types
export type LessonDetail = {
  id: string;
  title: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'GAME';
  storageType: 'YOUTUBE' | 'GOOGLE_DRIVE' | 'CLOUDINARY' | 'DIRECT_UPLOAD' | 'OTHER';
  storageUrl?: string | null;
  contentText?: string | null;
  duration?: number | null;
  transcript?: string | null;
  description?: string | null;
  resources?: Array<{
    name: string;
    url: string;
    type: string;
    size?: string;
  }>;
};

