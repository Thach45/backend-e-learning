import { createZodDto } from "nestjs-zod";
import {
  CreateCourseDetailBodySchema,
  UpdateCourseDetailBodySchema,
  GetCourseDetailParamsSchema,
  GetCourseDetailResponseSchema,
} from "./course-detail.model";

export class CreateCourseDetailBodyDto extends createZodDto(CreateCourseDetailBodySchema) {}
export class UpdateCourseDetailBodyDto extends createZodDto(UpdateCourseDetailBodySchema) {}
export class GetCourseDetailParamsDto extends createZodDto(GetCourseDetailParamsSchema) {}
export class GetCourseDetailResponseDto extends createZodDto(GetCourseDetailResponseSchema) {}

