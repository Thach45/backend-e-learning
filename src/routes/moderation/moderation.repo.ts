import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ReportStatus } from "@prisma/client";
import { PrismaService } from "src/shared/service/prisma.service";
import { GetReportsQuery, ModerationListQuery, ReportTargetType } from "./moderation.model";

type TargetInfo = {
  authorId: string;
  snapshot: string;
  context: string;
};

const authorSelect = { id: true, name: true, email: true, avatar: true } as const;
const lessonContext = {
  select: {
    title: true,
    content: { select: { course: { select: { id: true, title: true } } } },
  },
} as const;

const paginate = (page: number, limit: number) => ({ skip: (Math.max(page, 1) - 1) * limit, take: Number(limit) });
const meta = (total: number, page: number, limit: number) => ({
  total,
  page,
  limit: Number(limit),
  totalPages: Math.ceil(total / limit),
});

@Injectable()
export class ModerationRepo {
  constructor(private readonly prisma: PrismaService) {}

  private lessonLabel(lesson?: { title: string; content?: { course?: { title: string } | null } | null } | null) {
    if (!lesson) return "";
    const course = lesson.content?.course?.title;
    return course ? `${course} › ${lesson.title}` : lesson.title;
  }

  /** Lấy thông tin nội dung bị báo cáo (tác giả, nội dung, ngữ cảnh). Trả về null nếu không tồn tại. */
  async getTargetInfo(targetType: ReportTargetType, targetId: string): Promise<TargetInfo | null> {
    switch (targetType) {
      case "COMMENT": {
        const c = await this.prisma.comment.findUnique({
          where: { id: targetId },
          select: { userId: true, content: true, lesson: lessonContext },
        });
        return c ? { authorId: c.userId, snapshot: c.content, context: this.lessonLabel(c.lesson) } : null;
      }
      case "LESSON_QUESTION": {
        const q = await this.prisma.lessonQuestion.findUnique({
          where: { id: targetId },
          select: { userId: true, title: true, content: true, lesson: lessonContext },
        });
        return q
          ? { authorId: q.userId, snapshot: `${q.title}\n${q.content}`, context: this.lessonLabel(q.lesson) }
          : null;
      }
      case "LESSON_ANSWER": {
        const a = await this.prisma.lessonAnswer.findUnique({
          where: { id: targetId },
          select: { userId: true, content: true, question: { select: { lesson: lessonContext } } },
        });
        return a
          ? { authorId: a.userId, snapshot: a.content, context: this.lessonLabel(a.question.lesson) }
          : null;
      }
      case "REVIEW": {
        const r = await this.prisma.review.findUnique({
          where: { id: targetId },
          select: { userId: true, rating: true, comment: true, course: { select: { title: true } } },
        });
        return r
          ? { authorId: r.userId, snapshot: `${r.rating}★ ${r.comment ?? ""}`.trim(), context: r.course.title }
          : null;
      }
    }
  }

  async createReport(data: Prisma.ContentReportUncheckedCreateInput) {
    return this.prisma.contentReport.create({ data });
  }

  async findExistingReport(reporterId: string, targetType: ReportTargetType, targetId: string) {
    return this.prisma.contentReport.findUnique({
      where: { reporterId_targetType_targetId: { reporterId, targetType, targetId } },
      select: { id: true },
    });
  }

  async getReports(query: GetReportsQuery) {
    const { page, limit, status, targetType } = query;
    const where: Prisma.ContentReportWhereInput = {
      ...(status ? { status } : {}),
      ...(targetType ? { targetType } : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.contentReport.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { createdAt: "desc" },
        include: {
          reporter: { select: authorSelect },
          handledBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.contentReport.count({ where }),
    ]);

    // Đính kèm thông tin tác giả bị báo cáo + số báo cáo cùng đối tượng
    const authorIds = [...new Set(rows.map((r) => r.targetAuthorId).filter(Boolean) as string[])];
    const authors = authorIds.length
      ? await this.prisma.user.findMany({ where: { id: { in: authorIds } }, select: authorSelect })
      : [];
    const authorMap = new Map(authors.map((a) => [a.id, a]));

    const data = await Promise.all(
      rows.map(async (r) => ({
        ...r,
        targetAuthor: r.targetAuthorId ? authorMap.get(r.targetAuthorId) ?? null : null,
        targetExists: (await this.getTargetInfo(r.targetType, r.targetId)) !== null,
        reportCount: await this.prisma.contentReport.count({
          where: { targetType: r.targetType, targetId: r.targetId },
        }),
      })),
    );

    return { data, ...meta(total, page, limit) };
  }

  async getPendingCount() {
    return this.prisma.contentReport.count({ where: { status: ReportStatus.PENDING } });
  }

  async getReportById(id: string) {
    const report = await this.prisma.contentReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException(`Report with ID ${id} not found`);
    return report;
  }

  /** Đóng tất cả báo cáo đang chờ của cùng một đối tượng. */
  async closePendingReportsForTarget(
    targetType: ReportTargetType,
    targetId: string,
    data: { status: ReportStatus; handledById: string; resolutionNote?: string; contentRemoved: boolean },
  ) {
    return this.prisma.contentReport.updateMany({
      where: { targetType, targetId, status: ReportStatus.PENDING },
      data: { ...data, handledAt: new Date() },
    });
  }

  /** Gỡ nội dung. Trả về false nếu nội dung đã không còn. */
  async removeTarget(targetType: ReportTargetType, targetId: string): Promise<boolean> {
    try {
      switch (targetType) {
        case "COMMENT":
          await this.deleteComment(targetId);
          return true;
        case "LESSON_QUESTION":
          await this.prisma.lessonQuestion.delete({ where: { id: targetId } });
          return true;
        case "LESSON_ANSWER":
          await this.prisma.lessonAnswer.delete({ where: { id: targetId } });
          return true;
        case "REVIEW":
          await this.prisma.review.delete({ where: { id: targetId } });
          return true;
      }
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return false;
      throw e;
    }
  }

  /** Xóa bình luận cùng các phản hồi của nó (reaction tự cascade). */
  async deleteComment(id: string) {
    await this.prisma.$transaction([
      this.prisma.comment.deleteMany({ where: { parentId: id } }),
      this.prisma.comment.delete({ where: { id } }),
    ]);
  }

  async listComments(query: ModerationListQuery) {
    const { page, limit, search } = query;
    const where: Prisma.CommentWhereInput = search
      ? {
          OR: [
            { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { user: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            { user: { email: { contains: search, mode: Prisma.QueryMode.insensitive } } },
          ],
        }
      : {};
    const [rows, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          parentId: true,
          createdAt: true,
          user: { select: authorSelect },
          lesson: lessonContext,
          _count: { select: { replies: true, reactions: true } },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);
    const data = rows.map(({ lesson, ...rest }) => ({ ...rest, context: this.lessonLabel(lesson) }));
    return { data, ...meta(total, page, limit) };
  }

  async listQuestions(query: ModerationListQuery) {
    const { page, limit, search, resolved } = query;
    const where: Prisma.LessonQuestionWhereInput = {
      ...(resolved ? { isResolved: resolved === "true" } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { user: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.lessonQuestion.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          content: true,
          isResolved: true,
          createdAt: true,
          user: { select: authorSelect },
          lesson: lessonContext,
          answers: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              content: true,
              isInstructorAnswer: true,
              createdAt: true,
              user: { select: authorSelect },
            },
          },
        },
      }),
      this.prisma.lessonQuestion.count({ where }),
    ]);
    const data = rows.map(({ lesson, ...rest }) => ({ ...rest, context: this.lessonLabel(lesson) }));
    return { data, ...meta(total, page, limit) };
  }
}
