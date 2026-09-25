import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentsApi, type GetEnrollmentsParams, type Enrollment, type EnrollmentStats, type GetCourseContentsResponse, type LessonDetail } from '../api/enrollments';
import { toast } from 'sonner';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Get my enrollments
export const useMyEnrollments = (params?: GetEnrollmentsParams) => {
  return useQuery({
    queryKey: ['my-enrollments', params],
    queryFn: () => enrollmentsApi.getMyEnrollments(params),
  });
};

// Get enrollment stats
export const useMyEnrollmentStats = () => {
  return useQuery({
    queryKey: ['my-enrollment-stats'],
    queryFn: () => enrollmentsApi.getMyEnrollmentStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get "continue watching" widget data
export const useContinueWatching = () => {
  return useQuery({
    queryKey: ['continue-watching'],
    queryFn: () => enrollmentsApi.getContinueWatching(),
    staleTime: 60 * 1000,
  });
};

// Enroll in course mutation
export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (courseId: string) => enrollmentsApi.enrollInCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['my-enrollment-stats'] });
      toast.success('Ghi danh khóa học thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể ghi danh khóa học.'));
    },
  });
};

// Complete course mutation
export const useCompleteCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (courseId: string) => enrollmentsApi.completeCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['my-enrollment-stats'] });
      toast.success('Đã đánh dấu hoàn thành khóa học.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể cập nhật trạng thái hoàn thành.'));
    },
  });
};

// Get course contents for enrolled user (student view)
export const useEnrolledCourseContents = (courseId: string) => {
  return useQuery({
    queryKey: ['course-contents', courseId],
    queryFn: () => enrollmentsApi.getCourseContents(courseId),
    enabled: !!courseId,
  });
};

// Get lesson detail for enrolled user
export const useLessonDetail = (courseId: string, lessonId: string) => {
  return useQuery({
    queryKey: ['lesson-detail', courseId, lessonId],
    queryFn: () => enrollmentsApi.getLessonDetail(courseId, lessonId),
    enabled: !!courseId && !!lessonId,
  });
};

// Update lesson watch progress (silent - no toast, called frequently in background)
export const useUpdateLessonProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, lessonId, progressPercent }: { courseId: string; lessonId: string; progressPercent: number }) =>
      enrollmentsApi.updateLessonProgress(courseId, lessonId, progressPercent),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['continue-watching'] });
      queryClient.invalidateQueries({ queryKey: ['my-enrollment', variables.courseId] });
    },
  });
};

// Get my enrollment for a specific course (used to know completedAt for the survey CTA)
export const useMyEnrollmentByCourseId = (courseId: string) => {
  return useQuery({
    queryKey: ['my-enrollment', courseId],
    queryFn: () => enrollmentsApi.getEnrollmentByCourseId(courseId),
    enabled: !!courseId,
  });
};

