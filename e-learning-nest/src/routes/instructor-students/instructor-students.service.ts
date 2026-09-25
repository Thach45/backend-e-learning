import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/shared/service/prisma.service";
import { toCsv } from "src/shared/helper/csv";
import { overallProgress } from "src/shared/helper/progress";

interface Actor {
  userId: string;
  roleName?: string;
}

const MAX_EXPORT_ROWS = 5000;

@Injectable()
export class InstructorStudentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertCourseOwner(courseId: string, actor: Actor) {
    const course = await this.prisma.course.findFirst({ where: { id: courseId, deletedAt: null }, select: { id: true, title: true, instructorId: true } });
    if (!course) throw new NotFoundException("Không tìm thấy khóa học");
    if (actor.roleName !== "ADMIN" && course.instructorId !== actor.userId) throw new ForbiddenException("Bạn chỉ được xem học viên của khóa học của mình");
    return course;
  }

  private async lessonCounts(courseIds: string[]) {
    const lessons = await this.prisma.lesson.findMany({
      where: { deletedAt: null, isActive: true, content: { courseId: { in: courseIds }, deletedAt: null, isActive: true } },
      select: { content: { select: { courseId: true } } },
    });
    const counts = new Map<string, number>();
    for (const l of lessons) counts.set(l.content.courseId, (counts.get(l.content.courseId) ?? 0) + 1);
    return counts;
  }

  /** CSV học viên đã ghi danh khóa của giảng viên (một khóa hoặc tất cả khóa của mình). */
  async exportCsv(actor: Actor, opts: { courseId?: string; search?: string }) {
    let courseFilter: Prisma.EnrollmentWhereInput;
    if (opts.courseId) {
      await this.assertCourseOwner(opts.courseId, actor);
      courseFilter = { courseId: opts.courseId };
    } else if (actor.roleName === "ADMIN") {
      courseFilter = {};
    } else {
      courseFilter = { course: { instructorId: actor.userId, deletedAt: null } };
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        ...courseFilter,
        ...(opts.search
          ? { OR: [{ user: { name: { contains: opts.search, mode: "insensitive" } } }, { user: { email: { contains: opts.search, mode: "insensitive" } } }] }
          : {}),
      },
      select: { userId: true, courseId: true, enrolledAt: true, completedAt: true, user: { select: { name: true, email: true } }, course: { select: { title: true } } },
      orderBy: { enrolledAt: "desc" },
      take: MAX_EXPORT_ROWS,
    });

    const courseIds = [...new Set(enrollments.map((e) => e.courseId))];
    const [counts, progress] = await Promise.all([
      this.lessonCounts(courseIds),
      this.prisma.learningProgress.findMany({
        where: { courseId: { in: courseIds }, userId: { in: [...new Set(enrollments.map((e) => e.userId))] } },
        select: { userId: true, courseId: true, progressPercent: true, lastAccessed: true },
      }),
    ]);

    const byKey = new Map<string, { percents: number[]; last: Date | null; done: number }>();
    for (const p of progress) {
      const k = `${p.userId}:${p.courseId}`;
      const cur = byKey.get(k) ?? { percents: [], last: null, done: 0 };
      cur.percents.push(p.progressPercent);
      if (p.progressPercent >= 100) cur.done++;
      if (!cur.last || p.lastAccessed > cur.last) cur.last = p.lastAccessed;
      byKey.set(k, cur);
    }

    const fmt = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "");
    const rows = enrollments.map((e) => {
      const total = counts.get(e.courseId) ?? 0;
      const p = byKey.get(`${e.userId}:${e.courseId}`);
      return [e.user.name, e.user.email, e.course.title, fmt(e.enrolledAt), overallProgress(p?.percents ?? [], total), `${p?.done ?? 0}/${total}`, fmt(p?.last), fmt(e.completedAt)];
    });

    const csv = toCsv(
      ["Họ tên", "Email", "Khóa học", "Ngày ghi danh", "Tiến độ (%)", "Bài đã hoàn thành", "Truy cập gần nhất", "Ngày hoàn thành"],
      rows,
    );
    return { filename: `hoc-vien-${new Date().toISOString().slice(0, 10)}.csv`, csv, rowCount: rows.length };
  }

  /** Chi tiết tiến độ từng bài của một học viên trong một khóa + kết quả bài tập. */
  async studentProgress(actor: Actor, courseId: string, userId: string) {
    await this.assertCourseOwner(courseId, actor);
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { enrolledAt: true, completedAt: true, user: { select: { id: true, name: true, email: true, avatar: true } } },
    });
    if (!enrollment) throw new NotFoundException("Học viên chưa ghi danh khóa học này");

    const [contents, progress, submissions] = await Promise.all([
      this.prisma.courseContent.findMany({
        where: { courseId, deletedAt: null, isActive: true },
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          title: true,
          lessons: { where: { deletedAt: null, isActive: true }, orderBy: { createdAt: "asc" }, select: { id: true, title: true, duration: true } },
        },
      }),
      this.prisma.learningProgress.findMany({ where: { userId, courseId }, select: { lessonId: true, progressPercent: true, lastAccessed: true } }),
      this.prisma.submission.findMany({
        where: { userId, assignment: { courseId, deletedAt: null } },
        select: { status: true, score: true, isLate: true, submittedAt: true, assignment: { select: { title: true, maxScore: true } } },
        orderBy: { submittedAt: "desc" },
      }),
    ]);

    const byLesson = new Map(progress.map((p) => [p.lessonId, p]));
    const chapters = contents.map((c) => ({
      id: c.id,
      title: c.title,
      lessons: c.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        duration: l.duration,
        progressPercent: byLesson.get(l.id)?.progressPercent ?? 0,
        lastAccessed: byLesson.get(l.id)?.lastAccessed ?? null,
      })),
    }));
    const allLessons = chapters.flatMap((c) => c.lessons);

    return {
      student: enrollment.user,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      overallProgress: overallProgress(allLessons.map((l) => l.progressPercent), allLessons.length),
      completedLessons: allLessons.filter((l) => l.progressPercent >= 100).length,
      totalLessons: allLessons.length,
      chapters,
      assignments: submissions.map((s) => ({
        title: s.assignment.title,
        maxScore: s.assignment.maxScore,
        status: s.status,
        score: s.score,
        isLate: s.isLate,
        submittedAt: s.submittedAt,
      })),
    };
  }
}
