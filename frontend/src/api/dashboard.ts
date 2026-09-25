import apiClient from './axios';

// Types
export type OverviewStats = {
  totalUsers: number;
  totalCourses: number;
  totalDocuments: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  publishedCourses: number;
  verifiedDocuments: number;
  pendingOrders: number;
};

export type RevenueStats = {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  revenueGrowth: number;
  topCourses: Array<{
    courseId: string;
    courseTitle: string;
    revenue: number;
    enrollments: number;
  }>;
};

export type UserStats = {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsers: number;
  userGrowth: number;
  usersByRole: Array<{
    roleName: string;
    count: number;
  }>;
};

export type CourseStats = {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  averageRating: number;
  topCourses: Array<{
    courseId: string;
    title: string;
    enrollments: number;
    revenue: number;
    rating: number;
  }>;
};

export type DocumentStats = {
  totalDocuments: number;
  verifiedDocuments: number;
  totalViews: number;
  totalDownloads: number;
  totalLikes: number;
  topDocuments: Array<{
    documentId: string;
    title: string;
    views: number;
    downloads: number;
    likes: number;
  }>;
  topTags: Array<{
    tagId: string;
    tagName: string;
    documentCount: number;
  }>;
};

export type ChartDataPoint = {
  date: string;
  value: number;
};

export type ChartData = {
  data: ChartDataPoint[];
};

// API functions
export const dashboardApi = {
  getOverviewStats: async (): Promise<OverviewStats> => {
    const response = await apiClient.get('/admin/dashboard/overview');
    return response.data.data || response.data;
  },

  getRevenueStats: async (): Promise<RevenueStats> => {
    const response = await apiClient.get('/admin/dashboard/revenue');
    return response.data.data || response.data;
  },

  getUserStats: async (): Promise<UserStats> => {
    const response = await apiClient.get('/admin/dashboard/users');
    return response.data.data || response.data;
  },

  getCourseStats: async (): Promise<CourseStats> => {
    const response = await apiClient.get('/admin/dashboard/courses');
    return response.data.data || response.data;
  },

  getDocumentStats: async (): Promise<DocumentStats> => {
    const response = await apiClient.get('/admin/dashboard/documents');
    return response.data.data || response.data;
  },

  getRevenueChartData: async (days = 30): Promise<ChartData> => {
    const response = await apiClient.get('/admin/dashboard/charts/revenue', {
      params: { days },
    });
    return response.data.data || response.data;
  },

  getUserChartData: async (days = 30): Promise<ChartData> => {
    const response = await apiClient.get('/admin/dashboard/charts/users', {
      params: { days },
    });
    return response.data.data || response.data;
  },
};

