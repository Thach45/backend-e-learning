import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  reviewsApi, 
  type GetReviewsParams, 
  type CreateReviewBody, 
  type UpdateReviewBody 
} from '../api/reviews';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Get reviews by course
export const useReviewsByCourse = (courseId: string, params?: Omit<GetReviewsParams, 'courseId'>) => {
  return useQuery({
    queryKey: ['reviews', 'course', courseId, params],
    queryFn: () => reviewsApi.getReviewsByCourse(courseId, params),
    enabled: !!courseId,
  });
};

// Get my review for a course
export const useMyReview = (courseId: string) => {
  return useQuery({
    queryKey: ['my-review', courseId],
    queryFn: () => reviewsApi.getMyReview(courseId),
    enabled: !!courseId,
    retry: false, // Don't retry on 404 (user hasn't reviewed yet)
  });
};

// Create review mutation
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, body }: { courseId: string; body: CreateReviewBody }) => 
      reviewsApi.createReview(courseId, body),
    onSuccess: (_, variables) => {
      // Invalidate reviews for this course
      queryClient.invalidateQueries({ queryKey: ['reviews', 'course', variables.courseId] });
      // Invalidate my review
      queryClient.invalidateQueries({ queryKey: ['my-review', variables.courseId] });
      // Invalidate course detail (to update rating)
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
      // Invalidate course list (if rating affects listing)
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Đã gửi đánh giá.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể gửi đánh giá.'));
    },
  });
};

// Instructor: Get reviews for their course
export const useInstructorCourseReviews = (courseId: string, params?: Omit<GetReviewsParams, 'courseId'>) => {
  return useQuery({
    queryKey: ['instructor', 'reviews', 'course', courseId, params],
    queryFn: () => reviewsApi.getInstructorCourseReviews(courseId, params),
    enabled: !!courseId,
  });
};

// Instructor: Update review mutation
export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, reviewId, body }: { courseId: string; reviewId: string; body: UpdateReviewBody }) => 
      reviewsApi.updateReview(courseId, reviewId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'reviews', 'course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
      toast.success('Đã cập nhật đánh giá.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể cập nhật đánh giá.'));
    },
  });
};

// Instructor: Reply to review mutation
export const useReplyToReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, reviewId, reply }: { courseId: string; reviewId: string; reply: string }) =>
      reviewsApi.replyToReview(courseId, reviewId, reply),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'reviews', 'course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'course', variables.courseId] });
      toast.success('Đã gửi phản hồi đánh giá.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể gửi phản hồi.'));
    },
  });
};

// Instructor: Delete review mutation
export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, reviewId }: { courseId: string; reviewId: string }) => 
      reviewsApi.deleteReview(courseId, reviewId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'reviews', 'course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
      toast.success('Đã xóa đánh giá.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể xóa đánh giá.'));
    },
  });
};

// Admin: Get all reviews
export const useAdminReviews = (params?: GetReviewsParams) => {
  return useQuery({
    queryKey: ['admin', 'reviews', params],
    queryFn: () => reviewsApi.getReviews(params),
  });
};

// Admin: Get reviews by course
export const useAdminCourseReviews = (courseId: string, params?: Omit<GetReviewsParams, 'courseId'>) => {
  return useQuery({
    queryKey: ['admin', 'reviews', 'course', courseId, params],
    queryFn: () => reviewsApi.getAdminCourseReviews(courseId, params),
    enabled: !!courseId,
  });
};

// Admin: Update review mutation
export const useUpdateReviewAdmin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, reviewId, body }: { courseId: string; reviewId: string; body: UpdateReviewBody }) => 
      reviewsApi.updateReviewAdmin(courseId, reviewId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews', 'course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
      toast.success('Đã cập nhật đánh giá.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể cập nhật đánh giá.'));
    },
  });
};

// Admin: Delete review mutation
export const useDeleteReviewAdmin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, reviewId }: { courseId: string; reviewId: string }) => 
      reviewsApi.deleteReviewAdmin(courseId, reviewId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews', 'course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
      toast.success('Đã xóa đánh giá.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể xóa đánh giá.'));
    },
  });
};


// "Hữu ích" cho một đánh giá (không refetch cả danh sách: nơi gọi tự cập nhật số đếm từ kết quả trả về)
export const useSetReviewHelpful = () =>
  useMutation({
    mutationFn: ({ reviewId, on }: { reviewId: string; on: boolean }) => reviewsApi.setHelpful(reviewId, on),
    onError: (error) => {
      const e = error as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || 'Không thể thực hiện. Vui lòng thử lại.');
    },
  });
