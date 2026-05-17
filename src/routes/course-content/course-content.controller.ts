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
import { Public } from "src/shared/decorator/auth.decorator";
import { PrismaService } from "src/shared/service/prisma.service";



@Controller("api")
export class CourseContentController {
  constructor(
    private readonly courseContentService: CourseContentService,
    private readonly prisma: PrismaService,
  ) {}



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

  // Webhook nhận kết quả xử lý dubbing video từ worker Python
  @Public()
  @Post("webhook/video-done")
  async handleVideoDoneWebhook(
    @Body()
    body: {
      video_id: string;
      status: string;
      new_url: string;
    },
  ): Promise<{ received: boolean }> {
    console.log("[WEBHOOK] Video done payload:", body);

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(body.video_id)) {
      try {
        if (body.status === "SUCCESS" && body.new_url) {
          await this.prisma.lesson.update({
            where: { id: body.video_id },
            data: {
              storageUrl: body.new_url,
              storageType: "CLOUDFLARE_R2" as any,
              isActive: true,
            },
          });
          console.log(`[WEBHOOK] Successfully updated Lesson ${body.video_id} with HLS R2 URL: ${body.new_url}`);
        } else {
          console.warn(`[WEBHOOK] Task failed or missing URL for Lesson ${body.video_id}`);
        }
      } catch (error) {
        console.error(`[WEBHOOK] Failed to update database for Lesson ${body.video_id}:`, error.message);
      }
    } else {
      console.log(`[WEBHOOK] Received mock or non-UUID video_id: ${body.video_id}`);
    }

    return { received: true };
  }

}

