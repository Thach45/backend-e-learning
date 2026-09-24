import { createZodDto } from "nestjs-zod";
import {
  CreateCourseBodySchema,
  UpdateCourseBodySchema,
  GetCourseParamsSchema,
  GetCoursesQuerySchema,
  GetCourseResponseSchema,
  GetCourseSummaryResponseSchema,
  GetCoursesResponseSchema,
  GetRelatedCoursesQuerySchema,
  GetRelatedCoursesResponseSchema,
} from "./courses.model";

export class CreateCourseBodyDto extends createZodDto(CreateCourseBodySchema) {}
export class UpdateCourseBodyDto extends createZodDto(UpdateCourseBodySchema) {}
export class GetCourseParamsDto extends createZodDto(GetCourseParamsSchema) {}
export class GetCoursesQueryDto extends createZodDto(GetCoursesQuerySchema) {}
export class GetCourseResponseDto extends createZodDto(GetCourseResponseSchema) {}
export class GetCourseSummaryResponseDto extends createZodDto(GetCourseSummaryResponseSchema) {}
export class GetCoursesResponseDto extends createZodDto(GetCoursesResponseSchema) {}
export class GetRelatedCoursesQueryDto extends createZodDto(GetRelatedCoursesQuerySchema) {}
export class GetRelatedCoursesResponseDto extends createZodDto(GetRelatedCoursesResponseSchema) {}
// export class OverviewResponseDto extends createZodDto(OverviewResponseSchema) {}


