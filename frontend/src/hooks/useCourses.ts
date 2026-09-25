import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi, type CourseListParams, type CourseWithDetail, type Course } from '../api/courses';
import { toast } from 'sonner';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Get all courses
export const useCourses = (params?: CourseListParams) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => coursesApi.getCourses(params),
  });
};

// Get course by ID
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.getCourseById(id),
    enabled: !!id,
  });
};

// Bài học xem thử (công khai)
export const usePreviewLesson = (lessonId: string | null) => {
  return useQuery({
    queryKey: ['preview-lesson', lessonId],
    queryFn: () => coursesApi.getPreviewLesson(lessonId as string),
    enabled: !!lessonId,
    retry: false,
  });
};

// Get related courses (same category, falling back to same instructor / featured)
export const useRelatedCourses = (id: string, limit = 6) => {
  return useQuery({
    queryKey: ['related-courses', id, limit],
    queryFn: () => coursesApi.getRelatedCourses(id, limit),
    enabled: !!id,
  });
};

// Create course mutation
export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (body: Partial<Course>) => coursesApi.createCourse(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Đã tạo khóa học.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể tạo khóa học.'));
    },
  });
};

// Update course mutation
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Course> }) => 
      coursesApi.updateCourse(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.id] });
      toast.success('Đã cập nhật khóa học.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể cập nhật khóa học.'));
    },
  });
};

// Delete course mutation
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => coursesApi.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Đã xóa khóa học.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể xóa khóa học.'));
    },
  });
};

