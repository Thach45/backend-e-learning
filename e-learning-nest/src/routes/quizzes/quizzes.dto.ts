import { createZodDto } from "nestjs-zod";
import {
  QuizLessonParamsSchema,
  UpsertQuizBodySchema,
  SubmitQuizBodySchema,
  QuizSchema,
  QuizPublicSchema,
  QuizOrNullResponseSchema,
  QuizPublicOrNullResponseSchema,
  QuizAttemptResultSchema,
  GetQuizAttemptsResponseSchema,
} from "./quizzes.model";

export class QuizLessonParamsDto extends createZodDto(QuizLessonParamsSchema) {}
export class UpsertQuizBodyDto extends createZodDto(UpsertQuizBodySchema) {}
export class SubmitQuizBodyDto extends createZodDto(SubmitQuizBodySchema) {}
export class QuizResponseDto extends createZodDto(QuizSchema) {}
export class QuizPublicResponseDto extends createZodDto(QuizPublicSchema) {}
export class QuizOrNullResponseDto extends createZodDto(QuizOrNullResponseSchema) {}
export class QuizPublicOrNullResponseDto extends createZodDto(QuizPublicOrNullResponseSchema) {}
export class QuizAttemptResultResponseDto extends createZodDto(QuizAttemptResultSchema) {}
export class GetQuizAttemptsResponseDto extends createZodDto(GetQuizAttemptsResponseSchema) {}
