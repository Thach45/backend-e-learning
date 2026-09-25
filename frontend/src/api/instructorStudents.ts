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

export type StudentProgressDetail = {
  student: { id: string; name: string; email: string; avatar: string | null };
  enrolledAt: string;
  completedAt: string | null;
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  chapters: Array<{ id: string; title: string; lessons: Array<{ id: string; title: string; duration: number | null; progressPercent: number; lastAccessed: string | null }> }>;
  assignments: Array<{ title: string; maxScore: number; status: 'SUBMITTED' | 'GRADED' | 'RETURNED'; score: number | null; isLate: boolean; submittedAt: string }>;
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

  // Xuất CSV học viên (một khóa hoặc mọi khóa của tôi)
  exportCsv: async (params?: { courseId?: string; search?: string }): Promise<void> => {
    const response = await apiClient.get('/instructor/students/export', { params, responseType: 'blob' });
    const url = URL.createObjectURL(response.data as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hoc-vien-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  // Chi tiết tiến độ từng bài của một học viên trong một khóa + kết quả bài tập
  getStudentProgress: async (courseId: string, userId: string): Promise<StudentProgressDetail> => {
    const response = await apiClient.get(`/instructor/courses/${courseId}/students/${userId}/progress`);
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

