import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorCoursesApi, type GetInstructorCoursesParams, type CreateCourseBody, type UpdateCourseBody } from '../api/instructor';
import { toast } from 'sonner';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Get instructor courses
export const useInstructorCourses = (params?: GetInstructorCoursesParams) => {
  return useQuery({
    queryKey: ['instructor', 'courses', params],
    queryFn: async () => {
      const response = await instructorCoursesApi.getCourses(params);
      return response; // Response đã được xử lý trong API layer
    },
    refetchOnMount: true,
  });
};

// Get course by ID
export const useInstructorCourse = (id: string) => {
  return useQuery({
    queryKey: ['instructor', 'course', id],
    queryFn: () => instructorCoursesApi.getCourseById(id),
    enabled: !!id,
  });
};

// Create course mutation
export const useCreateInstructorCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (body: CreateCourseBody) => instructorCoursesApi.createCourse(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      toast.success('Tạo khóa học thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Tạo khóa học thất bại.'));
    },
  });
};

// Update course mutation
export const useUpdateInstructorCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCourseBody }) => 
      instructorCoursesApi.updateCourse(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'course', variables.id] });
      toast.success('Cập nhật khóa học thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Cập nhật khóa học thất bại.'));
    },
  });
};

// Delete course mutation
export const useDeleteInstructorCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => instructorCoursesApi.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      toast.success('Xóa khóa học thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Xóa khóa học thất bại.'));
    },
  });
};

// Request approval mutation
export const useRequestApproval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => instructorCoursesApi.requestApproval(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'course', id] });
      toast.success('Đã gửi yêu cầu duyệt khóa học.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Gửi yêu cầu duyệt thất bại.'));
    },
  });
};

// Request delete mutation
export const useRequestDelete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => instructorCoursesApi.requestDelete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'course', id] });
      toast.success('Đã gửi yêu cầu xóa khóa học.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Gửi yêu cầu xóa thất bại.'));
    },
  });
};

