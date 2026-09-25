import { createZodDto } from 'nestjs-zod';
import {
  GetInstructorStatsResponseSchema,
  GetCourseAnalyticsResponseSchema,
  GetRevenueChartDataResponseSchema,
  GetEnrolledStudentsResponseSchema,
  GetEnrolledStudentsQuerySchema,
  GetRevenueChartQuerySchema,
  UpdateInstructorProfileBodySchema,
  InstructorProfileResponseSchema,
  CourseIdParamsSchema,
  CourseDropoffAnalyticsSchema,
  CoursePreviewContentsSchema,
  PreviewLessonParamsSchema,
  PreviewLessonDetailSchema,
} from './instructor.model';

export class GetInstructorStatsResponseDto extends createZodDto(GetInstructorStatsResponseSchema) {}
export class GetCourseAnalyticsResponseDto extends createZodDto(GetCourseAnalyticsResponseSchema) {}
export class GetRevenueChartDataResponseDto extends createZodDto(GetRevenueChartDataResponseSchema) {}
export class GetEnrolledStudentsResponseDto extends createZodDto(GetEnrolledStudentsResponseSchema) {}
export class GetEnrolledStudentsQueryDto extends createZodDto(GetEnrolledStudentsQuerySchema) {}
export class GetRevenueChartQueryDto extends createZodDto(GetRevenueChartQuerySchema) {}
export class UpdateInstructorProfileBodyDto extends createZodDto(UpdateInstructorProfileBodySchema) {}
export class InstructorProfileResponseDto extends createZodDto(InstructorProfileResponseSchema) {}
export class CourseIdParamsDto extends createZodDto(CourseIdParamsSchema) {}
export class CourseDropoffAnalyticsResponseDto extends createZodDto(CourseDropoffAnalyticsSchema) {}
export class CoursePreviewContentsResponseDto extends createZodDto(CoursePreviewContentsSchema) {}
export class PreviewLessonParamsDto extends createZodDto(PreviewLessonParamsSchema) {}
export class PreviewLessonDetailResponseDto extends createZodDto(PreviewLessonDetailSchema) {}

