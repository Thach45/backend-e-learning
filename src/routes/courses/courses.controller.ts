import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { CoursesService } from "./courses.service";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import {
  CreateCourseBodyDto,
  GetCourseParamsDto,
  GetCoursesQueryDto,
  GetCourseResponseDto,
  GetCoursesResponseDto,
  UpdateCourseBodyDto,
} from "./courses.dto";

@Controller("api")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // Client-facing
  @Get("courses")
  @ZodSerializerDto(GetCoursesResponseDto)
  async getCourses(@Query() query: GetCoursesQueryDto) {
    // Client-facing: always show only published courses and ignore instructorId filter
    const q: any = { ...(query as any), status: 'PUBLISHED' };
    if ('instructorId' in q) delete q.instructorId;
    return this.coursesService.getCourses(q);
  }

  @Get("courses/:id")
  @ZodSerializerDto(GetCourseResponseDto)
  async getCourseById(@Param() params: GetCourseParamsDto) {
    return this.coursesService.getCourseById((params as any).id);
  }
  // @Get("courses/:id/overview")
  // @ZodSerializerDto(OverviewResponseDto)
  // async getCourseOverview(@Param() params: GetCourseParamsDto) {
  //   return this.coursesService.getCourseById((params as any).id);
  // }

  // Instructor-only
  @Get("instructor/courses")
  @ZodSerializerDto(GetCoursesResponseDto)
  async getOwnCourses(@Query() query: GetCoursesQueryDto, @ActiveUser() user: any) {
    return this.coursesService.getCourses({ ...(query as any), instructorId: user.userId });
  }

  @Post("instructor/courses")
  @ZodSerializerDto(GetCourseResponseDto)
  async createCourse(@Body() body: CreateCourseBodyDto, @ActiveUser() user: any) {
    return this.coursesService.createCourse(body as any, user);
  }
  @Get("instructor/courses/:id")
  @ZodSerializerDto(GetCourseResponseDto)
  async getInstructorCourseById(@Param() params: GetCourseParamsDto, @ActiveUser() user: any) {
    return this.coursesService.getCourseById((params as any).id);
  }
  @Put("instructor/courses/:id")
  @ZodSerializerDto(GetCourseResponseDto)
  async updateCourse(
    @Param() params: GetCourseParamsDto,
    @Body() body: UpdateCourseBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.coursesService.updateCourse((params as any).id, body as any, user);
  }

  @Delete("instructor/courses/:id")
  @ZodSerializerDto(GetCourseResponseDto)
  async deleteCourse(@Param() params: GetCourseParamsDto) {
    return this.coursesService.deleteCourse((params as any).id);
  }

  @Post("instructor/courses/:id/request-approval")
  @ZodSerializerDto(GetCourseResponseDto)
  async requestApproval(@Param() params: GetCourseParamsDto, @ActiveUser() user: any) {
    return this.coursesService.requestApproval((params as any).id, user.userId);
  }

  @Post("instructor/courses/:id/request-delete")
  @ZodSerializerDto(GetCourseResponseDto)
  async requestDelete(@Param() params: GetCourseParamsDto, @ActiveUser() user: any) {
    return this.coursesService.requestDelete((params as any).id, user.userId);
  }

  // Admin-only
  @Post("admin/courses/:id/approve-publish")
  @ZodSerializerDto(GetCourseResponseDto)
  async approvePublish(@Param() params: GetCourseParamsDto, @ActiveUser() user: any) {
    return this.coursesService.approvePublish((params as any).id, user.userId);
  }

  @Post("admin/courses/:id/reject-publish")
  @ZodSerializerDto(GetCourseResponseDto)
  async rejectPublish(@Param() params: GetCourseParamsDto, @ActiveUser() user: any) {
    return this.coursesService.rejectPublish((params as any).id, user.userId);
  }

  @Post("admin/courses/:id/approve-delete")
  @ZodSerializerDto(GetCourseResponseDto)
  async approveDelete(@Param() params: GetCourseParamsDto, @ActiveUser() user: any) {
    return this.coursesService.approveDelete((params as any).id, user.userId);
  }

  @Post("admin/courses/:id/reject-delete")
  @ZodSerializerDto(GetCourseResponseDto)
  async rejectDelete(@Param() params: GetCourseParamsDto, @ActiveUser() user: any) {
    return this.coursesService.rejectDelete((params as any).id, user.userId);
  }

  // Admin list all courses with pagination, filters, search
  @Get("admin/courses")
  @ZodSerializerDto(GetCoursesResponseDto)
  async adminListCourses(@Query() query: GetCoursesQueryDto) {
    return this.coursesService.getCourses(query as any);
  }
  @Get("admin/courses/:id")
  // chi tiết khóa học bao gồm cả cả course detail, course content, course lessons
  // @ZodSerializerDto(GetCourseResponseDto)
  async adminGetCourseById(@Param() params: GetCourseParamsDto) {
    return this.coursesService.getCourseByIdAdmin((params as any).id);
  }
}
