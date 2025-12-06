import { createZodDto } from "nestjs-zod";
import {
  CreateEnrollmentBodySchema,
  CreateEnrollmentByInstructorBodySchema,
  GetEnrollmentsQuerySchema,
  GetEnrollmentParamsSchema,
  GetEnrollmentsByCourseParamsSchema,
  GetEnrollmentResponseSchema,
  GetEnrollmentsResponseSchema,
  GetEnrollmentStatsResponseSchema,
  GetCourseContentsResponseSchema,
  LessonDetailSchema,
  GetLessonParamsSchema,
} from "./enrollments.model";

export class CreateEnrollmentBodyDto extends createZodDto(CreateEnrollmentBodySchema) {}
export class CreateEnrollmentByInstructorBodyDto extends createZodDto(CreateEnrollmentByInstructorBodySchema) {}
export class GetEnrollmentsQueryDto extends createZodDto(GetEnrollmentsQuerySchema) {}
export class GetEnrollmentParamsDto extends createZodDto(GetEnrollmentParamsSchema) {}
export class GetEnrollmentsByCourseParamsDto extends createZodDto(GetEnrollmentsByCourseParamsSchema) {}
export class GetEnrollmentResponseDto extends createZodDto(GetEnrollmentResponseSchema) {}
export class GetEnrollmentsResponseDto extends createZodDto(GetEnrollmentsResponseSchema) {}
export class GetEnrollmentStatsResponseDto extends createZodDto(GetEnrollmentStatsResponseSchema) {}
export class GetCourseContentsResponseDto extends createZodDto(GetCourseContentsResponseSchema) {}
export class GetLessonDetailResponseDto extends createZodDto(LessonDetailSchema) {}
export class GetLessonParamsDto extends createZodDto(GetLessonParamsSchema) {}

