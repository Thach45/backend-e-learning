import { z } from "zod";

export const LessonNoteSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  lessonId: z.string().uuid(),
  content: z.string(),
  timestampSeconds: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).strict();

export const GetLessonNotesParamsSchema = z.object({
  lessonId: z.string().uuid(),
}).strict();

export const LessonNoteParamsSchema = z.object({
  noteId: z.string().uuid(),
}).strict();

export const CreateLessonNoteBodySchema = z.object({
  content: z.string().min(1),
  timestampSeconds: z.number().int().nonnegative().default(0),
}).strict();

export const UpdateLessonNoteBodySchema = z.object({
  content: z.string().min(1).optional(),
  timestampSeconds: z.number().int().nonnegative().optional(),
}).strict();

export const GetLessonNotesResponseSchema = z.array(LessonNoteSchema);

export type LessonNote = z.infer<typeof LessonNoteSchema>;
export type GetLessonNotesParams = z.infer<typeof GetLessonNotesParamsSchema>;
export type LessonNoteParams = z.infer<typeof LessonNoteParamsSchema>;
export type CreateLessonNoteBody = z.infer<typeof CreateLessonNoteBodySchema>;
export type UpdateLessonNoteBody = z.infer<typeof UpdateLessonNoteBodySchema>;
export type GetLessonNotesResponse = z.infer<typeof GetLessonNotesResponseSchema>;
