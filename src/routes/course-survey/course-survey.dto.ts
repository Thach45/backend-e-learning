import { createZodDto } from "nestjs-zod";
import {
  CourseIdParamsSchema,
  SubmitSurveyBodySchema,
  SurveyOrNullResponseSchema,
  SurveyResultsSchema,
} from "./course-survey.model";

export class CourseIdParamsDto extends createZodDto(CourseIdParamsSchema) {}
export class SubmitSurveyBodyDto extends createZodDto(SubmitSurveyBodySchema) {}
export class SurveyOrNullResponseDto extends createZodDto(SurveyOrNullResponseSchema) {}
export class SurveyResultsResponseDto extends createZodDto(SurveyResultsSchema) {}
