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
import { VideoService } from "./translate-video.service";
import { Public } from "src/shared/decorator/auth.decorator";

@Controller("api")
export class CourseContentController {
  constructor(private readonly courseContentService: CourseContentService,
    private readonly videoService: VideoService,
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
  @Public()
  @Post('translate-video')
  async handleExpertUpload(@Body() body: any) {
    // 1. Lấy thông tin từ Frontend gửi lên
    const videoUrl = body.videoUrl; // Link video đã upload (ví dụ S3 URL)
    
    // 2. LƯU VÀO DATABASE (tui giả lập cái ID mới tạo ra nhé)
    const newVideoId = "vid_" + Date.now().toString();
    console.log(`[DB] Đã lưu video mới vào Database, ID: ${newVideoId}, trạng thái: PROCESSING`);

    // 3. ĐIỂM KÍCH HOẠT NẰM Ở ĐÂY ĐÂY ÔNG ƠI !!!
    // Gọi VideoService ném việc cho thằng Python
    await this.videoService.triggerDubbingJob(newVideoId, videoUrl);

    // 4. Trả kết quả về ngay và luôn cho Frontend, không bắt user chờ
    return {
      success: true,
      message: "Video đã lên sàn! Hệ thống AI đang tự động lồng tiếng, vui lòng chờ trong ít phút.",
      videoId: newVideoId
    };
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
    // TODO: cập nhật DB / trạng thái video theo video_id, new_url, status
    console.log("[WEBHOOK] Video done payload:", body);
    return { received: true };
  }
}

