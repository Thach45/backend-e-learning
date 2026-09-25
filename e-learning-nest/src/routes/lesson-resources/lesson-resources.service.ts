import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { normalizeSubtitle } from "./subtitle.util";

export const MAX_ATTACHMENTS_PER_LESSON = 10;
export const MAX_SUBTITLES_PER_LESSON = 8;

type Actor = { userId: string; roleName?: string };

@Injectable()
export class LessonResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  private async loadLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, deletedAt: null },
      select: { id: true, isPreview: true, content: { select: { courseId: true, course: { select: { instructorId: true } } } } },
    });
    if (!lesson) throw new NotFoundException("Không tìm thấy bài học.");
    return lesson;
  }

  /** Người quản lý bài học: giảng viên sở hữu khoá học hoặc admin. */
  private async assertManager(lessonId: string, actor: Actor) {
    const lesson = await this.loadLesson(lessonId);
    if (actor.roleName !== "ADMIN" && lesson.content.course.instructorId !== actor.userId) {
      throw new ForbiddenException("Bạn không quản lý khoá học này.");
    }
    return lesson;
  }

  /** Người xem được nội dung: quản lý, học viên đã ghi danh, hoặc bài xem thử. */
  private async assertViewer(lessonId: string, actor: Actor) {
    const lesson = await this.loadLesson(lessonId);
    if (lesson.isPreview || actor.roleName === "ADMIN" || lesson.content.course.instructorId === actor.userId) return lesson;
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: actor.userId, courseId: lesson.content.courseId } },
      select: { id: true },
    });
    if (!enrollment) throw new ForbiddenException("Bạn chưa ghi danh khoá học này.");
    return lesson;
  }

  // ----- Quản lý (giảng viên / admin) -----
  async listForManager(lessonId: string, actor: Actor) {
    await this.assertManager(lessonId, actor);
    const [attachments, subtitles] = await Promise.all([
      this.prisma.lessonAttachment.findMany({ where: { lessonId }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
      this.prisma.lessonSubtitle.findMany({ where: { lessonId }, orderBy: { language: "asc" }, select: { id: true, language: true, label: true, isDefault: true, updatedAt: true } }),
    ]);
    return { attachments, subtitles };
  }

  async addAttachment(lessonId: string, actor: Actor, input: { title: string; fileName: string; url: string; sizeBytes?: number }) {
    await this.assertManager(lessonId, actor);
    const count = await this.prisma.lessonAttachment.count({ where: { lessonId } });
    if (count >= MAX_ATTACHMENTS_PER_LESSON) throw new ConflictException(`Mỗi bài học chỉ đính kèm tối đa ${MAX_ATTACHMENTS_PER_LESSON} tệp.`);
    return this.prisma.lessonAttachment.create({ data: { lessonId, ...input, position: count, createdBy: actor.userId } });
  }

  async removeAttachment(lessonId: string, id: string, actor: Actor) {
    await this.assertManager(lessonId, actor);
    const res = await this.prisma.lessonAttachment.deleteMany({ where: { id, lessonId } });
    if (res.count === 0) throw new NotFoundException("Không tìm thấy tệp đính kèm.");
    return { deleted: true };
  }

  async upsertSubtitle(lessonId: string, language: string, actor: Actor, input: { label: string; content: string; isDefault: boolean }) {
    await this.assertManager(lessonId, actor);
    let content: string;
    try {
      content = normalizeSubtitle(input.content);
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
    const existing = await this.prisma.lessonSubtitle.findUnique({ where: { lessonId_language: { lessonId, language } }, select: { id: true } });
    if (!existing) {
      const count = await this.prisma.lessonSubtitle.count({ where: { lessonId } });
      if (count >= MAX_SUBTITLES_PER_LESSON) throw new ConflictException(`Mỗi bài học chỉ có tối đa ${MAX_SUBTITLES_PER_LESSON} phụ đề.`);
    }
    return this.prisma.$transaction(async (tx) => {
      // Chỉ một phụ đề mặc định mỗi bài
      if (input.isDefault) await tx.lessonSubtitle.updateMany({ where: { lessonId, NOT: { language } }, data: { isDefault: false } });
      const row = await tx.lessonSubtitle.upsert({
        where: { lessonId_language: { lessonId, language } },
        create: { lessonId, language, label: input.label, content, isDefault: input.isDefault, createdBy: actor.userId },
        update: { label: input.label, content, isDefault: input.isDefault },
        select: { id: true, language: true, label: true, isDefault: true, updatedAt: true },
      });
      return row;
    });
  }

  async removeSubtitle(lessonId: string, language: string, actor: Actor) {
    await this.assertManager(lessonId, actor);
    const res = await this.prisma.lessonSubtitle.deleteMany({ where: { lessonId, language } });
    if (res.count === 0) throw new NotFoundException("Không tìm thấy phụ đề.");
    return { deleted: true };
  }

  // ----- Người học -----
  async subtitlesForViewer(lessonId: string, actor: Actor) {
    await this.assertViewer(lessonId, actor);
    return this.prisma.lessonSubtitle.findMany({ where: { lessonId }, orderBy: { language: "asc" }, select: { language: true, label: true, isDefault: true, content: true } });
  }

  /** Dùng cho API xem thử công khai: chỉ trả nếu bài đang bật xem thử. */
  async subtitlesForPreview(lessonId: string) {
    return this.prisma.lessonSubtitle.findMany({
      where: { lessonId, lesson: { isPreview: true, deletedAt: null } },
      orderBy: { language: "asc" },
      select: { language: true, label: true, isDefault: true, content: true },
    });
  }

  attachmentsForLesson(lessonId: string) {
    return this.prisma.lessonAttachment.findMany({ where: { lessonId }, orderBy: [{ position: "asc" }, { createdAt: "asc" }], select: { title: true, url: true, fileName: true, sizeBytes: true } });
  }
}
