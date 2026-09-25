import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { CreateLessonNoteBody, UpdateLessonNoteBody } from "./lesson-notes.model";

const noteSelect = {
  id: true,
  userId: true,
  lessonId: true,
  content: true,
  timestampSeconds: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class LessonNotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Học viên đã ghi danh hoặc giảng viên sở hữu khóa học mới được thao tác note trên bài học. */
  private async ensureLessonAccess(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, deletedAt: null },
      select: {
        id: true,
        content: { select: { courseId: true, course: { select: { instructorId: true } } } },
      },
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const courseId = lesson.content.courseId;
    if (lesson.content.course.instructorId === userId) return;

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    });
    if (!enrollment) {
      throw new ForbiddenException("You are not enrolled in this course");
    }
  }

  async getNotes(lessonId: string, userId: string) {
    await this.ensureLessonAccess(lessonId, userId);
    return this.prisma.lessonNote.findMany({
      where: { lessonId, userId },
      select: noteSelect,
      orderBy: { timestampSeconds: "asc" },
    });
  }

  async createNote(lessonId: string, userId: string, body: CreateLessonNoteBody) {
    await this.ensureLessonAccess(lessonId, userId);
    return this.prisma.lessonNote.create({
      data: {
        lessonId,
        userId,
        content: body.content,
        timestampSeconds: body.timestampSeconds,
      },
      select: noteSelect,
    });
  }

  async updateNote(noteId: string, userId: string, body: UpdateLessonNoteBody) {
    const existing = await this.prisma.lessonNote.findUnique({
      where: { id: noteId },
      select: { id: true, userId: true },
    });
    if (!existing) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException("You can only edit your own notes");
    }

    return this.prisma.lessonNote.update({
      where: { id: noteId },
      data: {
        content: body.content ?? undefined,
        timestampSeconds: body.timestampSeconds ?? undefined,
      },
      select: noteSelect,
    });
  }

  async deleteNote(noteId: string, userId: string) {
    const existing = await this.prisma.lessonNote.findUnique({
      where: { id: noteId },
      select: { id: true, userId: true },
    });
    if (!existing) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException("You can only delete your own notes");
    }

    await this.prisma.lessonNote.delete({ where: { id: noteId } });
    return { success: true };
  }
}
