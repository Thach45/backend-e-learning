import { Controller, Get, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { InstructorService } from './instructor.service';
import {
  GetInstructorStatsResponseDto,
  GetCourseAnalyticsResponseDto,
  GetRevenueChartDataResponseDto,
  GetEnrolledStudentsResponseDto,
  GetEnrolledStudentsQueryDto,
  GetRevenueChartQueryDto,
} from './instructor.dto';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';

@Controller('api/instructor')
export class InstructorController {
  constructor(private readonly service: InstructorService) {}

  @Get('dashboard/stats')
  @ZodSerializerDto(GetInstructorStatsResponseDto)
  async getInstructorStats(@ActiveUser() user: any) {
    return this.service.getInstructorStats(user.userId);
  }

  @Get('analytics/courses')
  @ZodSerializerDto(GetCourseAnalyticsResponseDto)
  async getCourseAnalytics(@ActiveUser() user: any) {
    return this.service.getCourseAnalytics(user.userId);
  }

  @Get('revenue/chart')
  @ZodSerializerDto(GetRevenueChartDataResponseDto)
  async getRevenueChartData(
    @ActiveUser() user: any,
    @Query() query: GetRevenueChartQueryDto,
  ) {
    return this.service.getRevenueChartData(user.userId, query as any);
  }

  @Get('students')
  @ZodSerializerDto(GetEnrolledStudentsResponseDto)
  async getEnrolledStudents(
    @ActiveUser() user: any,
    @Query() query: GetEnrolledStudentsQueryDto,
  ) {
    return this.service.getEnrolledStudents(user.userId, query as any);
  }
}

