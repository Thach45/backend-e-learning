import { z } from 'zod';

// Overview Stats
export const OverviewStatsSchema = z.object({
  totalUsers: z.number(),
  totalCourses: z.number(),
  totalDocuments: z.number(),
  totalOrders: z.number(),
  totalRevenue: z.number(),
  activeUsers: z.number(),
  publishedCourses: z.number(),
  verifiedDocuments: z.number(),
  pendingOrders: z.number(),
});

export type OverviewStats = z.infer<typeof OverviewStatsSchema>;

// Revenue Stats
export const RevenueStatsSchema = z.object({
  totalRevenue: z.number(),
  monthlyRevenue: z.number(),
  weeklyRevenue: z.number(),
  dailyRevenue: z.number(),
  revenueGrowth: z.number(), // percentage
  topCourses: z.array(z.object({
    courseId: z.string(),
    courseTitle: z.string(),
    revenue: z.number(),
    enrollments: z.number(),
  })),
});

export type RevenueStats = z.infer<typeof RevenueStatsSchema>;

// User Stats
export const UserStatsSchema = z.object({
  totalUsers: z.number(),
  newUsersToday: z.number(),
  newUsersThisWeek: z.number(),
  newUsersThisMonth: z.number(),
  activeUsers: z.number(),
  userGrowth: z.number(), // percentage
  usersByRole: z.array(z.object({
    roleName: z.string(),
    count: z.number(),
  })),
});

export type UserStats = z.infer<typeof UserStatsSchema>;

// Course Stats
export const CourseStatsSchema = z.object({
  totalCourses: z.number(),
  publishedCourses: z.number(),
  draftCourses: z.number(),
  totalEnrollments: z.number(),
  averageRating: z.number(),
  topCourses: z.array(z.object({
    courseId: z.string(),
    title: z.string(),
    enrollments: z.number(),
    revenue: z.number(),
    rating: z.number(),
  })),
});

export type CourseStats = z.infer<typeof CourseStatsSchema>;

// Document Stats
export const DocumentStatsSchema = z.object({
  totalDocuments: z.number(),
  verifiedDocuments: z.number(),
  totalViews: z.number(),
  totalDownloads: z.number(),
  totalLikes: z.number(),
  topDocuments: z.array(z.object({
    documentId: z.string(),
    title: z.string(),
    views: z.number(),
    downloads: z.number(),
    likes: z.number(),
  })),
  topTags: z.array(z.object({
    tagId: z.string(),
    tagName: z.string(),
    documentCount: z.number(),
  })),
});

export type DocumentStats = z.infer<typeof DocumentStatsSchema>;

// Chart Data (for time series)
export const ChartDataPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

export type ChartDataPoint = z.infer<typeof ChartDataPointSchema>;

export const ChartDataSchema = z.object({
  data: z.array(ChartDataPointSchema),
});

export type ChartData = z.infer<typeof ChartDataSchema>;

// Response schemas
export const GetOverviewStatsResponseSchema = OverviewStatsSchema;
export type GetOverviewStatsResponse = z.infer<typeof GetOverviewStatsResponseSchema>;

export const GetRevenueStatsResponseSchema = RevenueStatsSchema;
export type GetRevenueStatsResponse = z.infer<typeof GetRevenueStatsResponseSchema>;

export const GetUserStatsResponseSchema = UserStatsSchema;
export type GetUserStatsResponse = z.infer<typeof GetUserStatsResponseSchema>;

export const GetCourseStatsResponseSchema = CourseStatsSchema;
export type GetCourseStatsResponse = z.infer<typeof GetCourseStatsResponseSchema>;

export const GetDocumentStatsResponseSchema = DocumentStatsSchema;
export type GetDocumentStatsResponse = z.infer<typeof GetDocumentStatsResponseSchema>;

export const GetChartDataResponseSchema = ChartDataSchema;
export type GetChartDataResponse = z.infer<typeof GetChartDataResponseSchema>;

