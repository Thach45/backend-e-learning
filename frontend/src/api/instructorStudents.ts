import apiClient from './axios';

export type InstructorStudent = {
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

export type GetInstructorStudentsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type GetInstructorStudentsResponse = {
  data: InstructorStudent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Instructor Students API functions
export const instructorStudentsApi = {
  // Get all students enrolled in instructor's courses
  getStudents: async (params?: GetInstructorStudentsParams): Promise<GetInstructorStudentsResponse> => {
    const response = await apiClient.get('/instructor/students', { params });
    return response.data.data;
  },

  // Remove student from course (delete enrollment)
  removeStudent: async (enrollmentId: string): Promise<void> => {
    await apiClient.delete(`/instructor/enrollments/${enrollmentId}`);
  },

  // Add student to course (create enrollment)
  addStudentToCourse: async (courseId: string, userId: string): Promise<InstructorStudent> => {
    const response = await apiClient.post(`/instructor/courses/${courseId}/enrollments`, { userId });
    return response.data.data;
  },
};

