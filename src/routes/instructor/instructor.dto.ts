import { createZodDto } from 'nestjs-zod';
import {
  GetInstructorStatsResponseSchema,
  GetCourseAnalyticsResponseSchema,
  GetRevenueChartDataResponseSchema,
  GetEnrolledStudentsResponseSchema,
  GetEnrolledStudentsQuerySchema,
  GetRevenueChartQuerySchema,
} from './instructor.model';

export class GetInstructorStatsResponseDto extends createZodDto(GetInstructorStatsResponseSchema) {}
export class GetCourseAnalyticsResponseDto extends createZodDto(GetCourseAnalyticsResponseSchema) {}
export class GetRevenueChartDataResponseDto extends createZodDto(GetRevenueChartDataResponseSchema) {}
export class GetEnrolledStudentsResponseDto extends createZodDto(GetEnrolledStudentsResponseSchema) {}
export class GetEnrolledStudentsQueryDto extends createZodDto(GetEnrolledStudentsQuerySchema) {}
export class GetRevenueChartQueryDto extends createZodDto(GetRevenueChartQuerySchema) {}

