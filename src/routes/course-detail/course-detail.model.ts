import { z } from "zod";

export const CourseDetailSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  objectives: z.string().nullable().optional(),
  requirements: z.string().nullable().optional(),
  targetAudience: z.string().nullable().optional(),
  benefits: z.string().nullable().optional(),
  relatedCourses: z.array(z.string().uuid()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetCourseDetailParamsSchema = z.object({
  courseId: z.string().uuid(),
}).strict();

export const CreateCourseDetailBodySchema = z.object({
  courseId: z.string().uuid(),
  description: z.string().optional(),
  content: z.string().optional(),
  objectives: z.string().optional(),
  requirements: z.string().optional(),
  targetAudience: z.string().optional(),
  benefits: z.string().optional(),
  relatedCourses: z.array(z.string().uuid()).optional().default([]),
}).strict();

export const UpdateCourseDetailBodySchema = z.object({
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  objectives: z.string().nullable().optional(),
  requirements: z.string().nullable().optional(),
  targetAudience: z.string().nullable().optional(),
  benefits: z.string().nullable().optional(),
  relatedCourses: z.array(z.string().uuid()).optional(),
}).strict();

export const GetCourseDetailResponseSchema = CourseDetailSchema;

export type CourseDetail = z.infer<typeof CourseDetailSchema>;
export type GetCourseDetailParams = z.infer<typeof GetCourseDetailParamsSchema>;
export type CreateCourseDetailBody = z.infer<typeof CreateCourseDetailBodySchema>;
export type UpdateCourseDetailBody = z.infer<typeof UpdateCourseDetailBodySchema>;
export type GetCourseDetailResponse = z.infer<typeof GetCourseDetailResponseSchema>;

