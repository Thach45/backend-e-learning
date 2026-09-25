import { useQuery } from '@tanstack/react-query';
import { adminEnrollmentsApi, type GetAdminEnrollmentsParams } from '../api/admin';

// Get admin enrollments
export const useAdminEnrollments = (params?: GetAdminEnrollmentsParams) => {
  return useQuery({
    queryKey: ['admin', 'enrollments', params],
    queryFn: async () => {
      const response = await adminEnrollmentsApi.getEnrollments(params);
      return response;
    },
  });
};

// Get enrollments by course
export const useAdminEnrollmentsByCourse = (courseId: string, params?: GetAdminEnrollmentsParams) => {
  return useQuery({
    queryKey: ['admin', 'enrollments', 'course', courseId, params],
    queryFn: async () => {
      const response = await adminEnrollmentsApi.getEnrollmentsByCourse(courseId, params);
      return response;
    },
    enabled: !!courseId,
  });
};

