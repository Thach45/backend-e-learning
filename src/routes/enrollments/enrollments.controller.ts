import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { EnrollmentsService } from "./enrollments.service";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import {
  CreateEnrollmentBodyDto,
  GetEnrollmentsQueryDto,
  GetEnrollmentParamsDto,
  GetEnrollmentsByCourseParamsDto,
  GetEnrollmentResponseDto,
  GetEnrollmentsResponseDto,
} from "./enrollments.dto";

@Controller("api")
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // Client endpoints
  @Post("courses/:courseId/enroll")
  @ZodSerializerDto(GetEnrollmentResponseDto)
  async enrollInCourse(@Param() params: GetEnrollmentParamsDto, @ActiveUser() user: any) {
    return this.enrollmentsService.createEnrollment(
      { courseId: (params as any).courseId },
      user.userId,
    );
  }

  @Get("my-enrollments")
  @ZodSerializerDto(GetEnrollmentsResponseDto)
  async getMyEnrollments(@Query() query: GetEnrollmentsQueryDto, @ActiveUser() user: any) {
    return this.enrollmentsService.getEnrollments(query as any, user.userId);
  }

  @Get("my-enrollments/:courseId")
  @ZodSerializerDto(GetEnrollmentResponseDto)
  async getMyEnrollmentByCourseId(@Param() params: GetEnrollmentParamsDto, @ActiveUser() user: any) {
    return this.enrollmentsService.getEnrollmentByCourseId((params as any).courseId, user.userId);
  }

  @Put("my-enrollments/:courseId/complete")
  @ZodSerializerDto(GetEnrollmentResponseDto)
  async completeCourse(@Param() params: GetEnrollmentParamsDto, @ActiveUser() user: any) {
    return this.enrollmentsService.completeEnrollment((params as any).courseId, user.userId);
  }

  // Instructor endpoints
  @Get("instructor/courses/:courseId/enrollments")
  @ZodSerializerDto(GetEnrollmentsResponseDto)
  async getCourseEnrollments(
    @Param() params: GetEnrollmentsByCourseParamsDto,
    @Query() query: GetEnrollmentsQueryDto,
    @ActiveUser() user: any,
  ) {
    return this.enrollmentsService.getEnrollmentsByCourse(
      (params as any).courseId,
      user.userId,
      query as any,
    );
  }

  @Get("instructor/students")
  @ZodSerializerDto(GetEnrollmentsResponseDto)
  async getInstructorStudents(
    @Query() query: GetEnrollmentsQueryDto,
    @ActiveUser() user: any,
  ) {
    return this.enrollmentsService.getInstructorStudents(user.userId, query as any);
  }

  // Admin endpoints
  @Get("admin/courses/:courseId/enrollments")
  @ZodSerializerDto(GetEnrollmentsResponseDto)
  async getCourseEnrollmentsAdmin(
    @Param() params: GetEnrollmentsByCourseParamsDto,
    @Query() query: GetEnrollmentsQueryDto,
  ) {
    return this.enrollmentsService.getEnrollments({
      ...(query as any),
      courseId: (params as any).courseId,
    });
  }
}

