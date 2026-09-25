import { z } from "zod";

export const CourseAnalyticsQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  search: z.string().trim().optional(),
  sortBy: z
    .enum(["enrollments", "rating", "completionRate", "satisfaction", "quizPassRate", "unansweredQuestions"])
    .optional()
    .default("enrollments"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
}).strict();

export const InstructorAnalyticsQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  search: z.string().trim().optional(),
  sortBy: z.enum(["students", "courses", "rating", "followers"]).optional().default("students"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
}).strict();

export const ExportParamsSchema = z.object({
  resource: z.enum([
    "users",
    "courses",
    "enrollments",
    "reviews",
    "audit-logs",
    "reports",
    "course-analytics",
    "instructor-analytics",
  ]),
}).strict();

export const ExportQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  // Bộ lọc tùy chọn cho một số tài nguyên
  action: z.string().optional(), // audit-logs
  targetType: z.string().optional(), // audit-logs
  status: z.string().optional(), // reports
}).strict();

export type CourseAnalyticsQuery = z.infer<typeof CourseAnalyticsQuerySchema>;
export type InstructorAnalyticsQuery = z.infer<typeof InstructorAnalyticsQuerySchema>;
export type ExportResource = z.infer<typeof ExportParamsSchema>["resource"];
export type ExportQuery = z.infer<typeof ExportQuerySchema>;
