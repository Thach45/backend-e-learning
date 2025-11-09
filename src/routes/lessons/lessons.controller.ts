import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { LessonsService } from "./lessons.service";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import {
  CreateLessonBodyDto,
  GetLessonParamsDto,
  GetLessonsParamsDto,
  GetLessonResponseDto,
  GetLessonsResponseDto,
  UpdateLessonBodyDto,
} from "./lessons.dto";

@Controller("api")
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  // Instructor-only
  @Get("instructor/courses/:courseId/contents/:contentId/lessons")
  // Note: Bỏ @ZodSerializerDto cho list endpoint vì có thể có vấn đề với array schema
  async getLessons(@Param() params: GetLessonsParamsDto, @ActiveUser() user: any) {
    return this.lessonsService.getLessons(
      (params as any).courseId,
      (params as any).contentId,
      user.userId,
    );
  }

  @Get("instructor/courses/:courseId/contents/:contentId/lessons/:id")
  @ZodSerializerDto(GetLessonResponseDto)
  async getLessonById(@Param() params: GetLessonParamsDto, @ActiveUser() user: any) {
    return this.lessonsService.getLessonById(
      (params as any).id,
      (params as any).courseId,
      (params as any).contentId,
      user.userId,
    );
  }

  @Post("instructor/courses/:courseId/contents/:contentId/lessons")
  @ZodSerializerDto(GetLessonResponseDto)
  async createLesson(
    @Param() params: GetLessonsParamsDto,
    @Body() body: CreateLessonBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.lessonsService.createLesson(
      { ...(body as any), contentId: (params as any).contentId },
      user.userId,
    );
  }

  @Put("instructor/courses/:courseId/contents/:contentId/lessons/:id")
  @ZodSerializerDto(GetLessonResponseDto)
  async updateLesson(
    @Param() params: GetLessonParamsDto,
    @Body() body: UpdateLessonBodyDto,
    @ActiveUser() user: any,
  ) {
    // Auto-detect and parse YouTube URL if storageType=YOUTUBE
    return this.lessonsService.updateLesson(
      (params as any).id,
      (params as any).courseId,
      (params as any).contentId,
      body as any,
      user.userId,
    );
  }

  @Delete("instructor/courses/:courseId/contents/:contentId/lessons/:id")
  async deleteLesson(@Param() params: GetLessonParamsDto, @ActiveUser() user: any) {
    return this.lessonsService.deleteLesson(
      (params as any).id,
      (params as any).courseId,
      (params as any).contentId,
      user.userId,
    );
  }
}

