import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { Public } from "src/shared/decorator/auth.decorator";
import { Audit } from "src/shared/decorator/audit.decorator";
import { LessonResourcesService } from "./lesson-resources.service";
import { MAX_SUBTITLE_CHARS } from "./subtitle.util";

const lang = z.string().regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/, "Mã ngôn ngữ dạng vi, en, pt-BR");
class LessonParamsDto extends createZodDto(z.object({ lessonId: z.string().uuid() }).strict()) {}
class AttachmentParamsDto extends createZodDto(z.object({ lessonId: z.string().uuid(), id: z.string().uuid() }).strict()) {}
class SubtitleParamsDto extends createZodDto(z.object({ lessonId: z.string().uuid(), language: lang }).strict()) {}
// Tệp tải lên qua /upload/file nên URL luôn là https; chặn mọi scheme khác (javascript:, data:, http:)
class AddAttachmentDto extends createZodDto(
  z.object({
    title: z.string().trim().min(1).max(150),
    fileName: z.string().trim().min(1).max(200),
    url: z.string().url().max(1000).refine((u) => u.startsWith("https://"), "Chỉ chấp nhận liên kết https"),
    sizeBytes: z.number().int().min(0).max(200_000_000).optional(),
  }).strict(),
) {}
class UpsertSubtitleDto extends createZodDto(
  z.object({
    label: z.string().trim().min(1).max(50),
    content: z.string().min(1).max(MAX_SUBTITLE_CHARS + 50_000),
    isDefault: z.boolean().default(false),
  }).strict(),
) {}

@Controller("api")
export class LessonResourcesController {
  constructor(private readonly service: LessonResourcesService) {}

  // Giảng viên / admin (ghi đè kiểm tra sở hữu trong service)
  @Get("instructor/lessons/:lessonId/resources")
  list(@Param() p: LessonParamsDto, @ActiveUser() user: any) {
    return this.service.listForManager(p.lessonId, user);
  }

  @Audit("lesson.attachment.add", "Lesson", { idParam: "lessonId" })
  @Post("instructor/lessons/:lessonId/attachments")
  add(@Param() p: LessonParamsDto, @Body() body: AddAttachmentDto, @ActiveUser() user: any) {
    return this.service.addAttachment(p.lessonId, user, body);
  }

  @Audit("lesson.attachment.remove", "Lesson", { idParam: "lessonId" })
  @Delete("instructor/lessons/:lessonId/attachments/:id")
  remove(@Param() p: AttachmentParamsDto, @ActiveUser() user: any) {
    return this.service.removeAttachment(p.lessonId, p.id, user);
  }

  @Audit("lesson.subtitle.save", "Lesson", { idParam: "lessonId" })
  @Put("instructor/lessons/:lessonId/subtitles/:language")
  saveSubtitle(@Param() p: SubtitleParamsDto, @Body() body: UpsertSubtitleDto, @ActiveUser() user: any) {
    return this.service.upsertSubtitle(p.lessonId, p.language, user, body);
  }

  @Audit("lesson.subtitle.remove", "Lesson", { idParam: "lessonId" })
  @Delete("instructor/lessons/:lessonId/subtitles/:language")
  removeSubtitle(@Param() p: SubtitleParamsDto, @ActiveUser() user: any) {
    return this.service.removeSubtitle(p.lessonId, p.language, user);
  }

  // Người học đã ghi danh (hoặc bài xem thử)
  @Get("lessons/:lessonId/subtitles")
  subtitles(@Param() p: LessonParamsDto, @ActiveUser() user: any) {
    return this.service.subtitlesForViewer(p.lessonId, user);
  }

  @Public()
  @Get("lessons/:lessonId/preview-subtitles")
  previewSubtitles(@Param() p: LessonParamsDto) {
    return this.service.subtitlesForPreview(p.lessonId);
  }
}
