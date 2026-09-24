import { createZodDto } from "nestjs-zod";
import {
  GetLessonNotesParamsSchema,
  LessonNoteParamsSchema,
  CreateLessonNoteBodySchema,
  UpdateLessonNoteBodySchema,
  LessonNoteSchema,
  GetLessonNotesResponseSchema,
} from "./lesson-notes.model";

export class GetLessonNotesParamsDto extends createZodDto(GetLessonNotesParamsSchema) {}
export class LessonNoteParamsDto extends createZodDto(LessonNoteParamsSchema) {}
export class CreateLessonNoteBodyDto extends createZodDto(CreateLessonNoteBodySchema) {}
export class UpdateLessonNoteBodyDto extends createZodDto(UpdateLessonNoteBodySchema) {}
export class LessonNoteResponseDto extends createZodDto(LessonNoteSchema) {}
export class GetLessonNotesResponseDto extends createZodDto(GetLessonNotesResponseSchema) {}
