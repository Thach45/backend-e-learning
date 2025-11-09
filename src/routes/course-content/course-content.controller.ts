import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { CourseContentService } from "./course-content.service";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import {
  CreateCourseContentBodyDto,
  GetCourseContentParamsDto,
  GetCourseContentsParamsDto,
  GetCourseContentResponseDto,
  GetCourseContentsResponseDto,
  UpdateCourseContentBodyDto,
  ReorderCourseContentsBodyDto,
} from "./course-content.dto";

@Controller("api")
export class CourseContentController {
  constructor(private readonly courseContentService: CourseContentService) {}

  // Instructor-only
  @Get("instructor/courses/:courseId/contents")
  // Note: Bỏ @ZodSerializerDto vì recursive schema (z.lazy) không tương thích với createZodDto
  async getCourseContents(@Param() params: GetCourseContentsParamsDto, @ActiveUser() user: any) {
    return this.courseContentService.getCourseContents((params as any).courseId, user.userId);
  }

  @Get("instructor/courses/:courseId/contents/:id")
  @ZodSerializerDto(GetCourseContentResponseDto)
  async getCourseContentById(@Param() params: GetCourseContentParamsDto, @ActiveUser() user: any) {
    return this.courseContentService.getCourseContentById(
      (params as any).id,
      (params as any).courseId,
      user.userId,
    );
  }

  @Post("instructor/courses/:courseId/contents")
  @ZodSerializerDto(GetCourseContentResponseDto)
  async createCourseContent(
    @Param() params: GetCourseContentsParamsDto,
    @Body() body: CreateCourseContentBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.courseContentService.createCourseContent(
      { ...(body as any), courseId: (params as any).courseId },
      user.userId,
    );
  }

  @Put("instructor/courses/:courseId/contents/:id")
  @ZodSerializerDto(GetCourseContentResponseDto)
  async updateCourseContent(
    @Param() params: GetCourseContentParamsDto,
    @Body() body: UpdateCourseContentBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.courseContentService.updateCourseContent(
      (params as any).id,
      (params as any).courseId,
      body as any,
      user.userId,
    );
  }

  @Delete("instructor/courses/:courseId/contents/:id")
  async deleteCourseContent(@Param() params: GetCourseContentParamsDto, @ActiveUser() user: any) {
    return this.courseContentService.deleteCourseContent(
      (params as any).id,
      (params as any).courseId,
      user.userId,
    );
  }

  @Put("instructor/courses/:courseId/contents/reorder")
  async reorderCourseContents(
    @Param() params: GetCourseContentsParamsDto,
    @Body() body: ReorderCourseContentsBodyDto,
    @ActiveUser() user: any,
  ) {
    console.log(body);
    return this.courseContentService.reorderCourseContents((params as any).courseId, body as any, user.userId);
  }
}

