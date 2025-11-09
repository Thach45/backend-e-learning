import { createZodDto } from "nestjs-zod";
import {
  CreateLessonBodySchema,
  UpdateLessonBodySchema,
  GetLessonsParamsSchema,
  GetLessonParamsSchema,
  GetLessonResponseSchema,
  GetLessonsResponseSchema,
} from "./lessons.model";

export class CreateLessonBodyDto extends createZodDto(CreateLessonBodySchema) {}
export class UpdateLessonBodyDto extends createZodDto(UpdateLessonBodySchema) {}
export class GetLessonsParamsDto extends createZodDto(GetLessonsParamsSchema) {}
export class GetLessonParamsDto extends createZodDto(GetLessonParamsSchema) {}
export class GetLessonResponseDto extends createZodDto(GetLessonResponseSchema) {}
export class GetLessonsResponseDto extends createZodDto(GetLessonsResponseSchema) {}

