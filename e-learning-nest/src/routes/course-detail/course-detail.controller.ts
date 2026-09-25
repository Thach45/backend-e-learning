import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { CourseDetailService } from "./course-detail.service";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import {
  CreateCourseDetailBodyDto,
  GetCourseDetailParamsDto,
  GetCourseDetailResponseDto,
  UpdateCourseDetailBodyDto,
} from "./course-detail.dto";

@Controller("api")
export class CourseDetailController {
  constructor(private readonly courseDetailService: CourseDetailService) {}

  // Client-facing
  @Get("courses/:courseId/detail")
  @ZodSerializerDto(GetCourseDetailResponseDto)
  async getCourseDetail(@Param() params: GetCourseDetailParamsDto) {
    return this.courseDetailService.getCourseDetailByCourseId((params as any).courseId, true);
  }

  // Instructor-only
  @Get("instructor/courses/:courseId/detail")
  @ZodSerializerDto(GetCourseDetailResponseDto)
  async getOwnCourseDetail(@Param() params: GetCourseDetailParamsDto, @ActiveUser() user: any) {
    return this.courseDetailService.getCourseDetailByCourseId((params as any).courseId, false);
  }

  @Post("instructor/courses/:courseId/detail")
  @ZodSerializerDto(GetCourseDetailResponseDto)
  async createCourseDetail(
    @Param() params: GetCourseDetailParamsDto,
    @Body() body: CreateCourseDetailBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.courseDetailService.createCourseDetail(
      { ...(body as any), courseId: (params as any).courseId },
      user.userId,
    );
  }

  @Put("instructor/courses/:courseId/detail")
  @ZodSerializerDto(GetCourseDetailResponseDto)
  async updateCourseDetail(
    @Param() params: GetCourseDetailParamsDto,
    @Body() body: UpdateCourseDetailBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.courseDetailService.updateCourseDetail((params as any).courseId, body as any, user.userId);
  }

  @Delete("instructor/courses/:courseId/detail")
  @ZodSerializerDto(GetCourseDetailResponseDto)
  async deleteCourseDetail(@Param() params: GetCourseDetailParamsDto, @ActiveUser() user: any) {
    return this.courseDetailService.deleteCourseDetail((params as any).courseId, user.userId);
  }
}

