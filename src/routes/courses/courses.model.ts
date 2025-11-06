import { z } from "zod";

export const CourseLevelEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);
export const CourseStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "PENDING_PUBLISHED", "PENDING_DRAFT"]);

// Base projection returned to clients
export const CourseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  price: z.number(),
  salePrice: z.number().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  introVideo: z.string().nullable().optional(),
  isFeatured: z.boolean(),
  level: CourseLevelEnum,
  status: CourseStatusEnum,
  instructorId: z.string().uuid(),
  categoryId: z.string().uuid().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  instructor: z.object({ id: z.string().uuid(), name: z.string() }).optional(),
  category: z.object({ id: z.string().uuid(), name: z.string() }).nullable().optional(),
  totalStars: z.number().optional(),
  totalLearners: z.number().optional(),
  totalLikes: z.number().optional(),
});

export const GetCoursesQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  search: z.string().trim().optional(),
  level: CourseLevelEnum.optional(),
  status: CourseStatusEnum.optional(),
  categoryId: z.string().uuid().optional(),
  instructorId: z.string().uuid().optional(),
}).strict();

export const GetCourseParamsSchema = z.object({
  id: z.string().uuid(),
}).strict();

export const CreateCourseBodySchema = z.object({
  title: z.string().min(1),
  price: z.number().nonnegative().default(0),
  salePrice: z.number().nonnegative().optional(),
  thumbnail: z.string().optional(),
  introVideo: z.string().optional(),
  isFeatured: z.boolean().optional(),
  level: CourseLevelEnum.default("BEGINNER"),
  status: CourseStatusEnum.default("DRAFT"),
  categoryId: z.string().uuid().optional(),
}).strict();

export const UpdateCourseBodySchema = z.object({
  title: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  salePrice: z.number().nonnegative().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  introVideo: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
  level: CourseLevelEnum.optional(),
  categoryId: z.string().uuid().nullable().optional(),
}).strict();

export const GetCourseResponseSchema = CourseSchema;

export const GetCoursesResponseSchema = z.object({
  data: z.array(CourseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
}).strict();

export type Course = z.infer<typeof CourseSchema>;
export type GetCoursesQuery = z.infer<typeof GetCoursesQuerySchema>;
export type GetCourseParams = z.infer<typeof GetCourseParamsSchema>;
export type CreateCourseBody = z.infer<typeof CreateCourseBodySchema>;
export type UpdateCourseBody = z.infer<typeof UpdateCourseBodySchema>;
export type GetCourseResponse = z.infer<typeof GetCourseResponseSchema>;
export type GetCoursesResponse = z.infer<typeof GetCoursesResponseSchema>;


