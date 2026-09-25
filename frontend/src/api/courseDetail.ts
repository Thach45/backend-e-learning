import apiClient from './axios';

/** CourseDetail từ API (có createdAt, updatedAt) - CourseDetail cơ bản lấy từ courses */
export type CourseDetailWithTimestamps = {
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

export type CreateCourseDetailBody = {
  courseId: string;
  description?: string;
  content?: string;
  objectives?: string;
  requirements?: string;
  targetAudience?: string;
  benefits?: string;
  relatedCourses?: string[];
};

export type UpdateCourseDetailBody = {
  description?: string | null;
  content?: string | null;
  objectives?: string | null;
  requirements?: string | null;
  targetAudience?: string | null;
  benefits?: string | null;
  relatedCourses?: string[];
};

// Course Detail API functions
export const courseDetailApi = {
  // Get course detail (instructor)
  getCourseDetail: async (courseId: string): Promise<CourseDetailWithTimestamps> => {
    const response = await apiClient.get(`/instructor/courses/${courseId}/detail`);
    return response.data.data;
  },

  // Create course detail
  createCourseDetail: async (courseId: string, body: CreateCourseDetailBody): Promise<CourseDetailWithTimestamps> => {
    const response = await apiClient.post(`/instructor/courses/${courseId}/detail`, body);
    return response.data.data;
  },

  // Update course detail
  updateCourseDetail: async (courseId: string, body: UpdateCourseDetailBody): Promise<CourseDetailWithTimestamps> => {
    const response = await apiClient.put(`/instructor/courses/${courseId}/detail`, body);
    return response.data.data;
  },

  // Delete course detail
  deleteCourseDetail: async (courseId: string): Promise<void> => {
    await apiClient.delete(`/instructor/courses/${courseId}/detail`);
  },
};

