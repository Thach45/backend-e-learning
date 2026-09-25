import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { InstructorService } from './instructor.service';
import {
  GetInstructorStatsResponseDto,
  GetCourseAnalyticsResponseDto,
  GetRevenueChartDataResponseDto,
  GetEnrolledStudentsResponseDto,
  GetEnrolledStudentsQueryDto,
  GetRevenueChartQueryDto,
  UpdateInstructorProfileBodyDto,
  InstructorProfileResponseDto,
  CourseIdParamsDto,
  CourseDropoffAnalyticsResponseDto,
  CoursePreviewContentsResponseDto,
  PreviewLessonParamsDto,
  PreviewLessonDetailResponseDto,
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

  @Patch('profile')
  @ZodSerializerDto(InstructorProfileResponseDto)
  async updateProfile(@ActiveUser() user: any, @Body() body: UpdateInstructorProfileBodyDto) {
    return this.service.updateProfile(user.userId, body);
  }

  @Get('courses/:courseId/analytics/dropoff')
  @ZodSerializerDto(CourseDropoffAnalyticsResponseDto)
  async getCourseDropoffAnalytics(@Param() params: CourseIdParamsDto, @ActiveUser() user: any) {
    return this.service.getCourseDropoffAnalytics(user.userId, params.courseId);
  }

  @Get('courses/:courseId/preview/contents')
  @ZodSerializerDto(CoursePreviewContentsResponseDto)
  async getCoursePreviewContents(@Param() params: CourseIdParamsDto, @ActiveUser() user: any) {
    return this.service.getCoursePreviewContents(user.userId, params.courseId);
  }

  @Get('courses/:courseId/preview/lessons/:lessonId')
  @ZodSerializerDto(PreviewLessonDetailResponseDto)
  async getPreviewLessonDetail(@Param() params: PreviewLessonParamsDto, @ActiveUser() user: any) {
    return this.service.getPreviewLessonDetail(user.userId, params.courseId, params.lessonId);
  }
}

