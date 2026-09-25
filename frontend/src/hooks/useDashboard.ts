import { useQuery } from '@tanstack/react-query';
import {
  dashboardApi,
  type OverviewStats,
  type RevenueStats,
  type UserStats,
  type CourseStats,
  type DocumentStats,
  type ChartData,
} from '../api/dashboard';

// Query keys
const DASHBOARD_KEY = 'dashboard';

// Hook to get overview stats
export const useOverviewStats = () => {
  return useQuery<OverviewStats>({
    queryKey: [DASHBOARD_KEY, 'overview'],
    queryFn: () => dashboardApi.getOverviewStats(),
    refetchInterval: 60000, // Refetch every minute
  });
};

// Hook to get revenue stats
export const useRevenueStats = () => {
  return useQuery<RevenueStats>({
    queryKey: [DASHBOARD_KEY, 'revenue'],
    queryFn: () => dashboardApi.getRevenueStats(),
    refetchInterval: 60000,
  });
};

// Hook to get user stats
export const useUserStats = () => {
  return useQuery<UserStats>({
    queryKey: [DASHBOARD_KEY, 'users'],
    queryFn: () => dashboardApi.getUserStats(),
    refetchInterval: 60000,
  });
};

// Hook to get course stats
export const useCourseStats = () => {
  return useQuery<CourseStats>({
    queryKey: [DASHBOARD_KEY, 'courses'],
    queryFn: () => dashboardApi.getCourseStats(),
    refetchInterval: 60000,
  });
};

// Hook to get document stats
export const useDocumentStats = () => {
  return useQuery<DocumentStats>({
    queryKey: [DASHBOARD_KEY, 'documents'],
    queryFn: () => dashboardApi.getDocumentStats(),
    refetchInterval: 60000,
  });
};

// Hook to get revenue chart data
export const useRevenueChartData = (days = 30) => {
  return useQuery<ChartData>({
    queryKey: [DASHBOARD_KEY, 'charts', 'revenue', days],
    queryFn: () => dashboardApi.getRevenueChartData(days),
  });
};

// Hook to get user chart data
export const useUserChartData = (days = 30) => {
  return useQuery<ChartData>({
    queryKey: [DASHBOARD_KEY, 'charts', 'users', days],
    queryFn: () => dashboardApi.getUserChartData(days),
  });
};

