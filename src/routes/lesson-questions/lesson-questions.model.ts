import { z } from "zod";

export const QuestionUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  avatar: z.string().nullable().optional(),
}).strict();

export const LessonAnswerSchema = z.object({
  id: z.string().uuid(),
  questionId: z.string().uuid(),
  userId: z.string().uuid(),
  content: z.string(),
  isInstructorAnswer: z.boolean(),
  createdAt: z.date(),
  user: QuestionUserSchema.optional(),
}).strict();

export const LessonQuestionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  lessonId: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  isResolved: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  user: QuestionUserSchema.optional(),
  answers: z.array(LessonAnswerSchema).optional(),
  answerCount: z.number().int().nonnegative().optional(),
}).strict();

export const GetLessonQuestionsParamsSchema = z.object({
  lessonId: z.string().uuid(),
}).strict();

export const QuestionParamsSchema = z.object({
  questionId: z.string().uuid(),
}).strict();

export const GetLessonQuestionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
}).strict();

export const CreateLessonQuestionBodySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
}).strict();

export const CreateLessonAnswerBodySchema = z.object({
  content: z.string().min(1),
}).strict();

export const GetLessonQuestionsResponseSchema = z.object({
  data: z.array(LessonQuestionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
}).strict();

export type LessonQuestion = z.infer<typeof LessonQuestionSchema>;
export type LessonAnswer = z.infer<typeof LessonAnswerSchema>;
export type GetLessonQuestionsParams = z.infer<typeof GetLessonQuestionsParamsSchema>;
export type QuestionParams = z.infer<typeof QuestionParamsSchema>;
export type GetLessonQuestionsQuery = z.infer<typeof GetLessonQuestionsQuerySchema>;
export type CreateLessonQuestionBody = z.infer<typeof CreateLessonQuestionBodySchema>;
export type CreateLessonAnswerBody = z.infer<typeof CreateLessonAnswerBodySchema>;
export type GetLessonQuestionsResponse = z.infer<typeof GetLessonQuestionsResponseSchema>;
