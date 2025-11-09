import { createZodDto } from "nestjs-zod";
import {
  CreateEnrollmentBodySchema,
  GetEnrollmentsQuerySchema,
  GetEnrollmentParamsSchema,
  GetEnrollmentsByCourseParamsSchema,
  GetEnrollmentResponseSchema,
  GetEnrollmentsResponseSchema,
} from "./enrollments.model";

export class CreateEnrollmentBodyDto extends createZodDto(CreateEnrollmentBodySchema) {}
export class GetEnrollmentsQueryDto extends createZodDto(GetEnrollmentsQuerySchema) {}
export class GetEnrollmentParamsDto extends createZodDto(GetEnrollmentParamsSchema) {}
export class GetEnrollmentsByCourseParamsDto extends createZodDto(GetEnrollmentsByCourseParamsSchema) {}
export class GetEnrollmentResponseDto extends createZodDto(GetEnrollmentResponseSchema) {}
export class GetEnrollmentsResponseDto extends createZodDto(GetEnrollmentsResponseSchema) {}

