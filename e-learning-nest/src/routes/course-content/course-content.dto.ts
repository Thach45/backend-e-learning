import { createZodDto } from "nestjs-zod";
import {
  CreateCourseContentBodySchema,
  UpdateCourseContentBodySchema,
  ReorderCourseContentsBodySchema,
  GetCourseContentsParamsSchema,
  GetCourseContentParamsSchema,
  GetCourseContentResponseSchema,
  GetCourseContentsResponseSchema,
} from "./course-content.model";

export class CreateCourseContentBodyDto extends createZodDto(CreateCourseContentBodySchema) {}
export class UpdateCourseContentBodyDto extends createZodDto(UpdateCourseContentBodySchema) {}
export class ReorderCourseContentsBodyDto extends createZodDto(ReorderCourseContentsBodySchema) {}
export class GetCourseContentsParamsDto extends createZodDto(GetCourseContentsParamsSchema) {}
export class GetCourseContentParamsDto extends createZodDto(GetCourseContentParamsSchema) {}
export class GetCourseContentResponseDto extends createZodDto(GetCourseContentResponseSchema) {}
export class GetCourseContentsResponseDto extends createZodDto(GetCourseContentsResponseSchema) {}

