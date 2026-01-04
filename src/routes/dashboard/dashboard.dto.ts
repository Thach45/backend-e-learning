import { createZodDto } from 'nestjs-zod';
import {
  GetOverviewStatsResponseSchema,
  GetRevenueStatsResponseSchema,
  GetUserStatsResponseSchema,
  GetCourseStatsResponseSchema,
  GetDocumentStatsResponseSchema,
  GetChartDataResponseSchema,
} from './dashboard.model';

export class GetOverviewStatsResponseDto extends createZodDto(GetOverviewStatsResponseSchema) {}
export class GetRevenueStatsResponseDto extends createZodDto(GetRevenueStatsResponseSchema) {}
export class GetUserStatsResponseDto extends createZodDto(GetUserStatsResponseSchema) {}
export class GetCourseStatsResponseDto extends createZodDto(GetCourseStatsResponseSchema) {}
export class GetDocumentStatsResponseDto extends createZodDto(GetDocumentStatsResponseSchema) {}
export class GetChartDataResponseDto extends createZodDto(GetChartDataResponseSchema) {}

