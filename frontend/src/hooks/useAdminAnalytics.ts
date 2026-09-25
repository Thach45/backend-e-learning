import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminAnalyticsApi, type AnalyticsListParams, type ExportResource } from '../api/adminAnalytics';

export const useAnalyticsOverview = () =>
  useQuery({ queryKey: ['admin-analytics', 'overview'], queryFn: () => adminAnalyticsApi.getOverview() });

export const useCourseAnalytics = (params?: AnalyticsListParams) =>
  useQuery({
    queryKey: ['admin-analytics', 'courses', params],
    queryFn: () => adminAnalyticsApi.getCourses(params),
  });

export const useInstructorAnalytics = (params?: AnalyticsListParams) =>
  useQuery({
    queryKey: ['admin-analytics', 'instructors', params],
    queryFn: () => adminAnalyticsApi.getInstructors(params),
  });

export const useExportCsv = () =>
  useMutation({
    mutationFn: ({ resource, params }: { resource: ExportResource; params?: Record<string, string | undefined> }) =>
      adminAnalyticsApi.exportCsv(resource, params),
    onError: () => toast.error('Không thể xuất file CSV.'),
  });
