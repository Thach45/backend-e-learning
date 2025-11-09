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

export const GetEnrollmentsQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
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

export type Enrollment = z.infer<typeof EnrollmentSchema>;
export type GetEnrollmentsQuery = z.infer<typeof GetEnrollmentsQuerySchema>;
export type GetEnrollmentParams = z.infer<typeof GetEnrollmentParamsSchema>;
export type GetEnrollmentsByCourseParams = z.infer<typeof GetEnrollmentsByCourseParamsSchema>;
export type CreateEnrollmentBody = z.infer<typeof CreateEnrollmentBodySchema>;
export type GetEnrollmentResponse = z.infer<typeof GetEnrollmentResponseSchema>;
export type GetEnrollmentsResponse = z.infer<typeof GetEnrollmentsResponseSchema>;

