import { createZodDto } from "nestjs-zod";
import {
  GetLessonQuestionsParamsSchema,
  QuestionParamsSchema,
  GetLessonQuestionsQuerySchema,
  CreateLessonQuestionBodySchema,
  CreateLessonAnswerBodySchema,
  LessonQuestionSchema,
  GetLessonQuestionsResponseSchema,
} from "./lesson-questions.model";

export class GetLessonQuestionsParamsDto extends createZodDto(GetLessonQuestionsParamsSchema) {}
export class QuestionParamsDto extends createZodDto(QuestionParamsSchema) {}
export class GetLessonQuestionsQueryDto extends createZodDto(GetLessonQuestionsQuerySchema) {}
export class CreateLessonQuestionBodyDto extends createZodDto(CreateLessonQuestionBodySchema) {}
export class CreateLessonAnswerBodyDto extends createZodDto(CreateLessonAnswerBodySchema) {}
export class LessonQuestionResponseDto extends createZodDto(LessonQuestionSchema) {}
export class GetLessonQuestionsResponseDto extends createZodDto(GetLessonQuestionsResponseSchema) {}
