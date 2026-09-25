import { z } from "zod";

const CourseContentBaseSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  parentId: z.string().uuid().nullable().optional(),
  title: z.string(),
  orderIndex: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CourseContentSchema: z.ZodType<any> = CourseContentBaseSchema.extend({
  children: z.array(z.lazy(() => CourseContentSchema)).optional(),
});

export const GetCourseContentsParamsSchema = z.object({
  courseId: z.string().uuid(),
}).strict();

export const GetCourseContentParamsSchema = z.object({
  courseId: z.string().uuid(),
  id: z.string().uuid(),
}).strict();

export const CreateCourseContentBodySchema = z.object({
  courseId: z.string().uuid(),
  parentId: z.string().uuid().nullable().optional(),
  title: z.string().min(1),
  orderIndex: z.number().int().nonnegative().optional().default(0),
}).strict();

export const UpdateCourseContentBodySchema = z.object({
  title: z.string().min(1).optional(),
  parentId: z.string().uuid().nullable().optional(),
  orderIndex: z.number().int().nonnegative().optional(),
}).strict();

export const ReorderCourseContentsBodySchema = z.object({
  contents: z.array(
    z.object({
      id: z.string().uuid(),
      orderIndex: z.number().int().nonnegative(),
    })
  ),
}).strict();

export const GetCourseContentResponseSchema = CourseContentSchema;

export const GetCourseContentsResponseSchema = z.array(CourseContentSchema);

export type CourseContent = z.infer<typeof CourseContentSchema>;
export type GetCourseContentsParams = z.infer<typeof GetCourseContentsParamsSchema>;
export type GetCourseContentParams = z.infer<typeof GetCourseContentParamsSchema>;
export type CreateCourseContentBody = z.infer<typeof CreateCourseContentBodySchema>;
export type UpdateCourseContentBody = z.infer<typeof UpdateCourseContentBodySchema>;
export type ReorderCourseContentsBody = z.infer<typeof ReorderCourseContentsBodySchema>;
export type GetCourseContentResponse = z.infer<typeof GetCourseContentResponseSchema>;
export type GetCourseContentsResponse = z.infer<typeof GetCourseContentsResponseSchema>;

