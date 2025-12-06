import { z } from "zod";

export const EnrollmentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
  enrolledAt: z.date(),
  completedAt: z.date().nullable().optional(),
  course: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      thumbnail: z.string().nullable().optional(),
      price: z.number(),
      salePrice: z.number().nullable().optional(),
      instructor: z.object({ id: z.string().uuid(), name: z.string() }).optional(),
    })
    .optional(),
  user: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
      avatar: z.string().nullable().optional(),
    })
    .optional(),
});

// Stats schema
export const EnrollmentStatsSchema = z.object({
  totalCourses: z.number(),
  completedCourses: z.number(),
  certificates: z.number(),
  learningHours: z.number(),
});

export const GetEnrollmentStatsResponseSchema = EnrollmentStatsSchema;

export const GetEnrollmentsQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  search: z.string().trim().optional(),
  courseId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  completed: z.coerce.boolean().optional(),
}).strict();

export const GetEnrollmentParamsSchema = z.object({
  courseId: z.string().uuid(),
}).strict();

export const GetEnrollmentsByCourseParamsSchema = z.object({
  courseId: z.string().uuid(),
}).strict();

export const CreateEnrollmentBodySchema = z.object({
  courseId: z.string().uuid(),
}).strict();

export const GetEnrollmentResponseSchema = EnrollmentSchema;

export const GetEnrollmentsResponseSchema = z.object({
  data: z.array(EnrollmentSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
}).strict();

// Course Content Schema for enrolled users
export const CourseContentSectionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  orderIndex: z.number(),
  duration: z.string().optional(),
  lessons: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      type: z.enum(['VIDEO', 'TEXT', 'QUIZ', 'GAME']),
      duration: z.string().optional(),
      isLocked: z.boolean().optional(),
    })
  ),
});

export const GetCourseContentsResponseSchema = z.object({
  courseId: z.string().uuid(),
  courseTitle: z.string(),
  contents: z.array(CourseContentSectionSchema),
}).strict();

// Lesson Detail Schema for enrolled users
export const LessonDetailSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  type: z.enum(['VIDEO', 'TEXT', 'QUIZ', 'GAME']),
  storageType: z.enum(['YOUTUBE', 'CLOUDINARY', 'DIRECT_UPLOAD', 'TEXT']),
  storageUrl: z.string().nullable().optional(),
  contentText: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  resources: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      type: z.string(),
      size: z.string().optional(),
    })
  ).optional(),
}).strict();

export const GetLessonParamsSchema = z.object({
  courseId: z.string().uuid(),
  lessonId: z.string().uuid(),
}).strict();

export type Enrollment = z.infer<typeof EnrollmentSchema>;
export type GetEnrollmentsQuery = z.infer<typeof GetEnrollmentsQuerySchema>;
export type GetEnrollmentParams = z.infer<typeof GetEnrollmentParamsSchema>;
export type GetEnrollmentsByCourseParams = z.infer<typeof GetEnrollmentsByCourseParamsSchema>;
export type CreateEnrollmentBody = z.infer<typeof CreateEnrollmentBodySchema>;
export type GetEnrollmentResponse = z.infer<typeof GetEnrollmentResponseSchema>;
export type GetEnrollmentsResponse = z.infer<typeof GetEnrollmentsResponseSchema>;
export type EnrollmentStats = z.infer<typeof EnrollmentStatsSchema>;
export type GetEnrollmentStatsResponse = z.infer<typeof GetEnrollmentStatsResponseSchema>;
export type GetCourseContentsResponse = z.infer<typeof GetCourseContentsResponseSchema>;
export type GetLessonDetailResponse = z.infer<typeof LessonDetailSchema>;
export type GetLessonParams = z.infer<typeof GetLessonParamsSchema>;

