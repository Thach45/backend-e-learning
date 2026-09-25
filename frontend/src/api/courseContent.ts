import apiClient from './axios';

// Types
export type StorageType = 'YOUTUBE' | 'GOOGLE_DRIVE' | 'CLOUDINARY' | 'DIRECT_UPLOAD' | 'CLOUDFLARE_R2' | 'OTHER';


export interface CourseContent {
  id: string;
  courseId: string;
  parentId: string | null;
  title: string;
  orderIndex: number;
  children?: CourseContent[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  contentId: string;
  title: string;
  storageType: StorageType;
  storageUrl: string | null;
  contentText: string | null;
  duration: number | null;
  transcript?: string | null;
  isPreview?: boolean;
  createdAt: string;
}

export interface CreateCourseContentBody {
  parentId?: string | null;
  title: string;
  courseId: string;
  orderIndex?: number;
}

export interface UpdateCourseContentBody {
  title?: string;
  parentId?: string | null;
  orderIndex?: number;
}

export interface ReorderCourseContentsBody {
  contents: Array<{
    id: string;
    orderIndex: number;
  }>;
}

export interface CreateLessonBody {
    contentId: string;
  title: string;
  storageType: StorageType;
  storageUrl?: string;
  contentText?: string;
  duration?: number;
  transcript?: string;
  isPreview?: boolean;
}

export interface UpdateLessonBody {
  title?: string;
  storageType?: StorageType;
  storageUrl?: string | null;
  contentText?: string | null;
  duration?: number | null;
  transcript?: string | null;
  isPreview?: boolean;
}

// Course Content API functions
export const courseContentApi = {
  // Get all course contents (chapters)
  getCourseContents: async (courseId: string): Promise<CourseContent[]> => {
    const response = await apiClient.get(`/instructor/courses/${courseId}/contents`);
    return response.data.data || response.data;
  },

  // Get course content by ID
  getCourseContentById: async (courseId: string, id: string): Promise<CourseContent> => {
    const response = await apiClient.get(`/instructor/courses/${courseId}/contents/${id}`);
    return response.data.data;
  },

  // Create course content (chapter)
  createCourseContent: async (courseId: string, body: CreateCourseContentBody): Promise<CourseContent> => {
    const response = await apiClient.post(`/instructor/courses/${courseId}/contents`, body);
    return response.data.data;
  },

  // Update course content
  updateCourseContent: async (
    courseId: string,
    id: string,
    body: UpdateCourseContentBody
  ): Promise<CourseContent> => {
    const response = await apiClient.put(`/instructor/courses/${courseId}/contents/${id}`, body);
    return response.data.data;
  },

  // Delete course content
  deleteCourseContent: async (courseId: string, id: string): Promise<void> => {
    await apiClient.delete(`/instructor/courses/${courseId}/contents/${id}`);
  },

  // Reorder course contents
  reorderCourseContents: async (courseId: string, body: ReorderCourseContentsBody): Promise<void> => {
    await apiClient.put(`/instructor/courses/${courseId}/contents/reorder`, body);
  },
};

// Lessons API functions
export const lessonsApi = {
  // Get all lessons in a content
  getLessons: async (courseId: string, contentId: string): Promise<Lesson[]> => {
    const response = await apiClient.get(`/instructor/courses/${courseId}/contents/${contentId}/lessons`);
    return response.data.data || response.data;
  },

  // Get lesson by ID
  getLessonById: async (courseId: string, contentId: string, id: string): Promise<Lesson> => {
    const response = await apiClient.get(`/instructor/courses/${courseId}/contents/${contentId}/lessons/${id}`);
    return response.data.data;
  },

  // Create lesson
  createLesson: async (courseId: string, contentId: string, body: CreateLessonBody): Promise<Lesson> => {
    const response = await apiClient.post(`/instructor/courses/${courseId}/contents/${contentId}/lessons`, body);
    return response.data.data;
  },

  // Update lesson
  updateLesson: async (
    courseId: string,
    contentId: string,
    id: string,
    body: UpdateLessonBody
  ): Promise<Lesson> => {
    const response = await apiClient.put(`/instructor/courses/${courseId}/contents/${contentId}/lessons/${id}`, body);
    return response.data.data;
  },

  // Delete lesson
  deleteLesson: async (courseId: string, contentId: string, id: string): Promise<void> => {
    await apiClient.delete(`/instructor/courses/${courseId}/contents/${contentId}/lessons/${id}`);
  },
};

