import apiClient from './axios';

// Types
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'CLIENT';

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  avatar?: string | null;
  status: UserStatus;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
};

export type GetAdminUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  role?: UserRole;
};

export type GetAdminUsersResponse = {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateUserBody = {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
};

export type UpdateUserBody = {
  email?: string;
  password?: string;
  name?: string;
  phoneNumber?: string;
  avatar?: string;
  status?: UserStatus;
  roles?: UserRole[];
};

export type UpdateUserStatusBody = {
  status: UserStatus;
};

// Admin Users API functions
export const adminUsersApi = {
  // Get users list
  getUsers: async (params?: GetAdminUsersParams): Promise<GetAdminUsersResponse> => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<AdminUser> => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data.data;
  },

  // Create user
  createUser: async (body: CreateUserBody): Promise<AdminUser> => {
    const response = await apiClient.post('/admin/users', body);
    return response.data.data;
  },

  // Update user
  updateUser: async (id: string, body: UpdateUserBody): Promise<AdminUser> => {
    const response = await apiClient.put(`/admin/users/${id}`, body);
    return response.data.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  // Update user status
  updateUserStatus: async (id: string, body: UpdateUserStatusBody): Promise<AdminUser> => {
    const response = await apiClient.put(`/admin/users/${id}/status`, body);
    return response.data.data;
  },
};

// Admin Courses Types
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PENDING_PUBLISHED' | 'PENDING_DRAFT';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type AdminCourse = {
  id: string;
  title: string;
  price: number;
  salePrice?: number | null;
  thumbnail?: string | null;
  introVideo?: string | null;
  isFeatured: boolean;
  level: CourseLevel;
  status: CourseStatus;
  instructorId: string;
  categoryId?: string | null;
  createdAt: string;
  updatedAt: string;
  instructor?: { id: string; name: string };
  category?: { id: string; name: string } | null;
  totalStars?: number;
  totalLearners?: number;
  totalLikes?: number;
};

export type AdminCourseDetail = {
  id: string;
  courseId: string;
  description?: string | null;
  content?: string | null;
  objectives?: string | null;
  requirements?: string | null;
  targetAudience?: string | null;
  benefits?: string | null;
  relatedCourses: string[];
  createdAt: string;
  updatedAt: string;
};

export type AdminCourseContent = {
  id: string;
  courseId: string;
  parentId?: string | null;
  title: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  lessons: AdminLesson[];
  children?: AdminCourseContent[];
};

export type AdminLesson = {
  id: string;
  contentId: string;
  title: string;
  storageType: string;
  storageUrl?: string | null;
  contentText?: string | null;
  duration?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCourseFull = AdminCourse & {
  courseDetail?: AdminCourseDetail | null;
  courseContents: AdminCourseContent[];
};

export type GetAdminCoursesParams = {
  page?: number;
  limit?: number;
  search?: string;
  level?: CourseLevel;
  status?: CourseStatus;
  categoryId?: string;
  instructorId?: string;
};

export type GetAdminCoursesResponse = {
  data: AdminCourse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Admin Courses API functions
export const adminCoursesApi = {
  // Get courses list
  getCourses: async (params?: GetAdminCoursesParams): Promise<GetAdminCoursesResponse> => {
    const response = await apiClient.get('/admin/courses', { params });
    return response.data.data;
  },

  // Get course by ID (full detail)
  getCourseById: async (id: string): Promise<AdminCourseFull> => {
    const response = await apiClient.get(`/admin/courses/${id}`);
    return response.data.data;
  },

  // Approve publish
  approvePublish: async (id: string): Promise<AdminCourse> => {
    const response = await apiClient.post(`/admin/courses/${id}/approve-publish`);
    return response.data.data;
  },

  // Reject publish
  rejectPublish: async (id: string): Promise<AdminCourse> => {
    const response = await apiClient.post(`/admin/courses/${id}/reject-publish`);
    return response.data.data;
  },

  // Approve delete
  approveDelete: async (id: string): Promise<AdminCourse> => {
    const response = await apiClient.post(`/admin/courses/${id}/approve-delete`);
    return response.data.data;
  },

  // Reject delete
  rejectDelete: async (id: string): Promise<AdminCourse> => {
    const response = await apiClient.post(`/admin/courses/${id}/reject-delete`);
    return response.data.data;
  },
};

// Admin Categories Types
export type AdminCategory = {
  id: string;
  name: string;
  imageUrl?: string | null;
  parentId?: string | null;
  countCourses: number;
};

const normalizeAdminCategoryList = (payload: unknown): AdminCategory[] => {
  if (Array.isArray(payload)) {
    return payload as AdminCategory[];
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: AdminCategory[] }).data;
  }

  return [];
};

export type CreateCategoryBody = {
  name: string;
  imageUrl?: string;
  parentId?: string;
  isActive?: boolean;
};

export type UpdateCategoryBody = {
  name?: string;
  imageUrl?: string;
  parentId?: string | null;
  isActive?: boolean;
};

// Admin Categories API functions
export const adminCategoriesApi = {
  // Get all categories
  getCategories: async (): Promise<AdminCategory[]> => {
    const response = await apiClient.get('/admin/categories');
    return normalizeAdminCategoryList(response.data.data);
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<AdminCategory> => {
    const response = await apiClient.get(`/admin/categories/${id}`);
    return response.data.data;
  },

  // Create category
  createCategory: async (body: CreateCategoryBody): Promise<AdminCategory> => {
    const response = await apiClient.post('/admin/categories', body);
    return response.data.data;
  },

  // Update category
  updateCategory: async (id: string, body: UpdateCategoryBody): Promise<AdminCategory> => {
    const response = await apiClient.put(`/admin/categories/${id}`, body);
    return response.data.data;
  },
};

// Admin Enrollments Types
export type AdminEnrollment = {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string | null;
  progress?: number;
  lastAccessed?: string;
  course?: {
    id: string;
    title: string;
    thumbnail?: string | null;
    price: number;
    salePrice?: number | null;
    instructor?: { id: string; name: string };
  };
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
};

export type GetAdminEnrollmentsParams = {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
  userId?: string;
  completed?: boolean;
};

export type GetAdminEnrollmentsResponse = {
  data: AdminEnrollment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Admin Enrollments API functions
export const adminEnrollmentsApi = {
  // Get all enrollments
  getEnrollments: async (params?: GetAdminEnrollmentsParams): Promise<GetAdminEnrollmentsResponse> => {
    const response = await apiClient.get('/admin/enrollments', { params });
    return response.data.data;
  },

  // Get enrollments by course
  getEnrollmentsByCourse: async (courseId: string, params?: GetAdminEnrollmentsParams): Promise<GetAdminEnrollmentsResponse> => {
    const response = await apiClient.get(`/admin/courses/${courseId}/enrollments`, { params });
    return response.data.data;
  },
};

// Admin Reviews Types
export type AdminReview = {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment?: string | null;
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

export type GetAdminReviewsParams = {
  page?: number;
  limit?: number;
  courseId?: string;
  userId?: string;
  rating?: number;
};

export type GetAdminReviewsResponse = {
  data: AdminReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type UpdateReviewBody = {
  rating?: number;
  comment?: string | null;
};

// Admin Reviews API functions
export const adminReviewsApi = {
  // Get all reviews
  getReviews: async (params?: GetAdminReviewsParams): Promise<GetAdminReviewsResponse> => {
    const response = await apiClient.get('/admin/reviews', { params });
    return response.data.data;
  },

  // Get reviews by course
  getReviewsByCourse: async (courseId: string, params?: GetAdminReviewsParams): Promise<GetAdminReviewsResponse> => {
    const response = await apiClient.get(`/admin/courses/${courseId}/reviews`, { params });
    return response.data.data;
  },

  // Update review
  updateReview: async (courseId: string, reviewId: string, body: UpdateReviewBody): Promise<AdminReview> => {
    const response = await apiClient.put(`/admin/courses/${courseId}/reviews/${reviewId}`, body);
    return response.data.data;
  },

  // Delete review
  deleteReview: async (courseId: string, reviewId: string): Promise<void> => {
    await apiClient.delete(`/admin/courses/${courseId}/reviews/${reviewId}`);
  },
};

