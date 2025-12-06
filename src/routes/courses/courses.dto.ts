import { createZodDto } from "nestjs-zod";
import {
  CreateCourseBodySchema,
  UpdateCourseBodySchema,
  GetCourseParamsSchema,
  GetCoursesQuerySchema,
  GetCourseResponseSchema,
  GetCoursesResponseSchema,
} from "./courses.model";

export class CreateCourseBodyDto extends createZodDto(CreateCourseBodySchema) {}
export class UpdateCourseBodyDto extends createZodDto(UpdateCourseBodySchema) {}
export class GetCourseParamsDto extends createZodDto(GetCourseParamsSchema) {}
export class GetCoursesQueryDto extends createZodDto(GetCoursesQuerySchema) {}
export class GetCourseResponseDto extends createZodDto(GetCourseResponseSchema) {}
export class GetCoursesResponseDto extends createZodDto(GetCoursesResponseSchema) {}
// export class OverviewResponseDto extends createZodDto(OverviewResponseSchema) {}


