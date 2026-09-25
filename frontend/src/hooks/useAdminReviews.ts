import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminReviewsApi, type GetAdminReviewsParams, type UpdateReviewBody } from '../api/admin';
import { toast } from 'sonner';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Get admin reviews
export const useAdminReviews = (params?: GetAdminReviewsParams) => {
  return useQuery({
    queryKey: ['admin', 'reviews', params],
    queryFn: async () => {
      const response = await adminReviewsApi.getReviews(params);
      return response;
    },
  });
};

// Get reviews by course
export const useAdminReviewsByCourse = (courseId: string, params?: GetAdminReviewsParams) => {
  return useQuery({
    queryKey: ['admin', 'reviews', 'course', courseId, params],
    queryFn: async () => {
      const response = await adminReviewsApi.getReviewsByCourse(courseId, params);
      return response;
    },
    enabled: !!courseId,
  });
};

// Update review mutation
export const useUpdateAdminReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, reviewId, body }: { courseId: string; reviewId: string; body: UpdateReviewBody }) => 
      adminReviewsApi.updateReview(courseId, reviewId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      toast.success('Đã cập nhật đánh giá.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể cập nhật đánh giá.'));
    },
  });
};

// Delete review mutation
export const useDeleteAdminReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, reviewId }: { courseId: string; reviewId: string }) => 
      adminReviewsApi.deleteReview(courseId, reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      toast.success('Đã xóa đánh giá.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể xóa đánh giá.'));
    },
  });
};

