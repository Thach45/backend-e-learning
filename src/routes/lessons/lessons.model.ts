import { z } from "zod";

export const StorageTypeEnum = z.enum(["YOUTUBE", "GOOGLE_DRIVE", "CLOUDINARY", "DIRECT_UPLOAD", "OTHER", "CLOUDFLARE_R2"]);

export const LessonSchema = z.object({
  id: z.string().uuid(),
  contentId: z.string().uuid(),
  title: z.string(),
  storageType: StorageTypeEnum,
  storageUrl: z.string().nullable().optional(),
  contentText: z.string().nullable().optional(),
  duration: z.number().int().nonnegative().nullable().optional(),
  createdAt: z.date(),
});

export const GetLessonsParamsSchema = z.object({
  courseId: z.string().uuid(),
  contentId: z.string().uuid(),
}).strict();

export const GetLessonParamsSchema = z.object({
  courseId: z.string().uuid(),
  contentId: z.string().uuid(),
  id: z.string().uuid(),
}).strict();

export const CreateLessonBodySchema = z.object({
  contentId: z.string().uuid(),
  title: z.string().min(1),
  storageType: StorageTypeEnum,
  storageUrl: z.string().optional(),
  contentText: z.string().optional(),
  duration: z.number().int().nonnegative().optional(),
}).strict();

export const UpdateLessonBodySchema = z.object({
  title: z.string().min(1).optional(),
  storageType: StorageTypeEnum.optional(),
  storageUrl: z.string().nullable().optional(),
  contentText: z.string().nullable().optional(),
  duration: z.number().int().nonnegative().nullable().optional(),
}).strict();

export const GetLessonResponseSchema = LessonSchema;

export const GetLessonsResponseSchema = z.array(LessonSchema);

export type Lesson = z.infer<typeof LessonSchema>;
export type GetLessonsParams = z.infer<typeof GetLessonsParamsSchema>;
export type GetLessonParams = z.infer<typeof GetLessonParamsSchema>;
export type CreateLessonBody = z.infer<typeof CreateLessonBodySchema>;
export type UpdateLessonBody = z.infer<typeof UpdateLessonBodySchema>;
export type GetLessonResponse = z.infer<typeof GetLessonResponseSchema>;
export type GetLessonsResponse = z.infer<typeof GetLessonsResponseSchema>;

