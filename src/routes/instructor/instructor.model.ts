import { z } from 'zod';

// Instructor Dashboard Stats
export const InstructorStatsSchema = z.object({
  totalCourses: z.number(),
  publishedCourses: z.number(),
  draftCourses: z.number(),
  totalEnrollments: z.number(),
  totalRevenue: z.number(),
  monthlyRevenue: z.number(),
  averageRating: z.number(),
  totalStudents: z.number(),
  totalReviews: z.number(),
});

export type InstructorStats = z.infer<typeof InstructorStatsSchema>;

// Course Analytics
export const CourseAnalyticsSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string(),
  enrollments: z.number(),
  revenue: z.number(),
  views: z.number(),
  averageRating: z.number(),
  totalReviews: z.number(),
  completionRate: z.number(),
});

export type CourseAnalytics = z.infer<typeof CourseAnalyticsSchema>;

// Revenue Chart Data
export const RevenueChartDataPointSchema = z.object({
  date: z.string(),
  revenue: z.number(),
  enrollments: z.number(),
});

export type RevenueChartDataPoint = z.infer<typeof RevenueChartDataPointSchema>;

export const RevenueChartDataSchema = z.object({
  data: z.array(RevenueChartDataPointSchema),
});

export type RevenueChartData = z.infer<typeof RevenueChartDataSchema>;

// Student enrolled in instructor's courses
export const EnrolledStudentSchema = z.object({
  userId: z.string().uuid(),
  userName: z.string(),
  userEmail: z.string(),
  userAvatar: z.string().nullable().optional(),
  courseId: z.string().uuid(),
  courseTitle: z.string(),
  enrolledAt: z.date(),
  progress: z.number().optional(),
  completedAt: z.date().nullable().optional(),
});

export type EnrolledStudent = z.infer<typeof EnrolledStudentSchema>;

// Response schemas
export const GetInstructorStatsResponseSchema = InstructorStatsSchema;
export type GetInstructorStatsResponse = z.infer<typeof GetInstructorStatsResponseSchema>;

export const GetCourseAnalyticsResponseSchema = z.object({
  data: z.array(CourseAnalyticsSchema),
});
export type GetCourseAnalyticsResponse = z.infer<typeof GetCourseAnalyticsResponseSchema>;

export const GetRevenueChartDataResponseSchema = RevenueChartDataSchema;
export type GetRevenueChartDataResponse = z.infer<typeof GetRevenueChartDataResponseSchema>;

export const GetEnrolledStudentsResponseSchema = z.object({
  data: z.array(EnrolledStudentSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
export type GetEnrolledStudentsResponse = z.infer<typeof GetEnrolledStudentsResponseSchema>;

// Query params
export const GetEnrolledStudentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  courseId: z.string().uuid().optional(),
  search: z.string().optional(),
}).strict();

export type GetEnrolledStudentsQuery = z.infer<typeof GetEnrolledStudentsQuerySchema>;

// Revenue Chart Query
export const GetRevenueChartQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).strict().refine(
  (data) => {
    // Either days or (startDate and endDate) must be provided
    if (data.days) return true;
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end;
    }
    return false;
  },
  { message: 'Either days or both startDate and endDate must be provided, and startDate must be <= endDate' }
);

export type GetRevenueChartQuery = z.infer<typeof GetRevenueChartQuerySchema>;

// Instructor public profile (bio, social links, expertise)
export const UpdateInstructorProfileBodySchema = z.object({
  title: z.string().max(150).optional(),
  bio: z.string().max(2000).optional(),
  expertise: z.array(z.string().min(1).max(50)).max(20).optional(),
  yearsOfExperience: z.coerce.number().int().min(0).max(80).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  facebookUrl: z.string().url().optional().or(z.literal('')),
}).strict();

export type UpdateInstructorProfileBody = z.infer<typeof UpdateInstructorProfileBodySchema>;

export const InstructorProfileResponseSchema = z.object({
  title: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  expertise: z.array(z.string()),
  yearsOfExperience: z.number().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  youtubeUrl: z.string().nullable().optional(),
  facebookUrl: z.string().nullable().optional(),
}).strict();

export type InstructorProfileResponse = z.infer<typeof InstructorProfileResponseSchema>;

