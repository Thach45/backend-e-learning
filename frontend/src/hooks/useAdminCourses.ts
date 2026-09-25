import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCoursesApi, type GetAdminCoursesParams } from '../api/admin';
import { toast } from 'sonner';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Get admin courses
export const useAdminCourses = (params?: GetAdminCoursesParams) => {
  return useQuery({
    queryKey: ['admin', 'courses', params],
    queryFn: async () => {
      const response = await adminCoursesApi.getCourses(params);
      return response;
    },
  });
};

// Get course by ID (full detail)
export const useAdminCourse = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'course', id],
    queryFn: () => adminCoursesApi.getCourseById(id),
    enabled: !!id,
  });
};

// Approve publish mutation
export const useApprovePublish = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminCoursesApi.approvePublish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'course', id] });
      toast.success('Đã duyệt xuất bản khóa học.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể duyệt xuất bản.'));
    },
  });
};

// Reject publish mutation
export const useRejectPublish = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminCoursesApi.rejectPublish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'course', id] });
      toast.success('Đã từ chối xuất bản khóa học.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể từ chối xuất bản.'));
    },
  });
};

// Approve delete mutation
export const useApproveDelete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminCoursesApi.approveDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success('Đã duyệt xóa khóa học.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể duyệt xóa khóa học.'));
    },
  });
};

// Reject delete mutation
export const useRejectDelete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminCoursesApi.rejectDelete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'course', id] });
      toast.success('Đã từ chối xóa khóa học.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể từ chối xóa khóa học.'));
    },
  });
};

