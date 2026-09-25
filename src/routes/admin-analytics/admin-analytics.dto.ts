import { createZodDto } from "nestjs-zod";
import {
  CourseAnalyticsQuerySchema,
  InstructorAnalyticsQuerySchema,
  ExportParamsSchema,
  ExportQuerySchema,
} from "./admin-analytics.model";

export class CourseAnalyticsQueryDto extends createZodDto(CourseAnalyticsQuerySchema) {}
export class InstructorAnalyticsQueryDto extends createZodDto(InstructorAnalyticsQuerySchema) {}
export class ExportParamsDto extends createZodDto(ExportParamsSchema) {}
export class ExportQueryDto extends createZodDto(ExportQuerySchema) {}
