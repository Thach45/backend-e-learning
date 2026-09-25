import { z } from "zod";

export const CourseSurveyResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
  difficultyRating: z.number().int().min(1).max(5),
  satisfactionRating: z.number().int().min(1).max(5),
  wouldRecommend: z.boolean(),
  feedback: z.string().nullable().optional(),
  createdAt: z.date(),
}).strict();

export const CourseIdParamsSchema = z.object({
  courseId: z.string().uuid(),
}).strict();

export const SubmitSurveyBodySchema = z.object({
  difficultyRating: z.number().int().min(1).max(5),
  satisfactionRating: z.number().int().min(1).max(5),
  wouldRecommend: z.boolean(),
  feedback: z.string().max(2000).optional(),
}).strict();

export const SurveyOrNullResponseSchema = z.object({ survey: CourseSurveyResponseSchema.nullable() }).strict();

export const SurveyResultsSchema = z.object({
  courseId: z.string().uuid(),
  totalResponses: z.number().int(),
  averageDifficulty: z.number(),
  averageSatisfaction: z.number(),
  recommendPercent: z.number(),
  feedback: z.array(
    z.object({
      id: z.string().uuid(),
      userName: z.string(),
      difficultyRating: z.number().int(),
      satisfactionRating: z.number().int(),
      wouldRecommend: z.boolean(),
      feedback: z.string().nullable().optional(),
      createdAt: z.date(),
    })
  ),
}).strict();

export type CourseSurveyResponse = z.infer<typeof CourseSurveyResponseSchema>;
export type CourseIdParams = z.infer<typeof CourseIdParamsSchema>;
export type SubmitSurveyBody = z.infer<typeof SubmitSurveyBodySchema>;
export type SurveyResults = z.infer<typeof SurveyResultsSchema>;
