import { z } from "zod";

// ----- Instructor-facing (includes correct answers) -----

export const QuizOptionSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  isCorrect: z.boolean(),
}).strict();

export const QuizQuestionSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  orderIndex: z.number().int(),
  options: z.array(QuizOptionSchema),
}).strict();

export const QuizSchema = z.object({
  id: z.string().uuid(),
  lessonId: z.string().uuid(),
  title: z.string(),
  passingScore: z.number().int().min(0).max(100),
  questions: z.array(QuizQuestionSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
}).strict();

// ----- Student-facing (correct answers hidden) -----

export const QuizOptionPublicSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
}).strict();

export const QuizQuestionPublicSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  orderIndex: z.number().int(),
  options: z.array(QuizOptionPublicSchema),
}).strict();

export const QuizPublicSchema = z.object({
  id: z.string().uuid(),
  lessonId: z.string().uuid(),
  title: z.string(),
  passingScore: z.number().int().min(0).max(100),
  questions: z.array(QuizQuestionPublicSchema),
}).strict();

// ----- Params / bodies -----

export const QuizLessonParamsSchema = z.object({
  lessonId: z.string().uuid(),
}).strict();

export const UpsertQuizOptionBodySchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean().default(false),
}).strict();

export const UpsertQuizQuestionBodySchema = z.object({
  text: z.string().min(1),
  orderIndex: z.number().int().nonnegative().default(0),
  options: z.array(UpsertQuizOptionBodySchema).min(2, "A question needs at least 2 options"),
}).strict();

export const UpsertQuizBodySchema = z.object({
  title: z.string().min(1),
  passingScore: z.number().int().min(0).max(100).default(70),
  questions: z.array(UpsertQuizQuestionBodySchema).min(1, "A quiz needs at least 1 question"),
}).strict();

export const SubmitQuizAnswerSchema = z.object({
  questionId: z.string().uuid(),
  optionId: z.string().uuid(),
}).strict();

export const SubmitQuizBodySchema = z.object({
  answers: z.array(SubmitQuizAnswerSchema).min(1),
}).strict();

export const QuizAttemptResultSchema = z.object({
  id: z.string().uuid(),
  quizId: z.string().uuid(),
  scorePercent: z.number().int(),
  passed: z.boolean(),
  submittedAt: z.date(),
  correctOptionByQuestion: z.record(z.string(), z.string()),
}).strict();

export const QuizAttemptSchema = z.object({
  id: z.string().uuid(),
  scorePercent: z.number().int(),
  passed: z.boolean(),
  submittedAt: z.date(),
}).strict();

export const GetQuizAttemptsResponseSchema = z.array(QuizAttemptSchema);

export const QuizOrNullResponseSchema = z.object({ quiz: QuizSchema.nullable() }).strict();
export const QuizPublicOrNullResponseSchema = z.object({ quiz: QuizPublicSchema.nullable() }).strict();

export type QuizOption = z.infer<typeof QuizOptionSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type QuizPublic = z.infer<typeof QuizPublicSchema>;
export type QuizLessonParams = z.infer<typeof QuizLessonParamsSchema>;
export type UpsertQuizBody = z.infer<typeof UpsertQuizBodySchema>;
export type SubmitQuizBody = z.infer<typeof SubmitQuizBodySchema>;
export type QuizAttemptResult = z.infer<typeof QuizAttemptResultSchema>;
export type QuizAttempt = z.infer<typeof QuizAttemptSchema>;
export type GetQuizAttemptsResponse = z.infer<typeof GetQuizAttemptsResponseSchema>;
