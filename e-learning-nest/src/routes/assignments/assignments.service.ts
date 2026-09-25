import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/shared/service/prisma.service";
import { SendEmailService } from "src/shared/service/send-email.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateAssignmentBody, GradeBody, ListSubmissionsQuery, SubmitBody, UpdateAssignmentBody } from "./assignments.model";

interface Actor {
  userId: string;
  roleName?: string;
}

const assignmentSelect = {
  id: true,
  courseId: true,
  lessonId: true,
  title: true,
  description: true,
  dueAt: true,
  maxScore: true,
  allowLate: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AssignmentSelect;

const submissionSelect = {
  id: true,
  assignmentId: true,
  userId: true,
  textContent: true,
  fileUrl: true,
  fileName: true,
  status: true,
  isLate: true,
  score: true,
  feedback: true,
  gradedAt: true,
  submittedAt: true,
} satisfies Prisma.SubmissionSelect;

const publicUrl = () => (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly mail: SendEmailService,
  ) {}

  // ---------------------------------------------------------------- quyền
  private async assertCourseOwner(courseId: string, actor: Actor) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, title: true, instructorId: true },
    });
    if (!course) throw new NotFoundException("Không tìm thấy khóa học");
    if (actor.roleName !== "ADMIN" && course.instructorId !== actor.userId) {
      throw new ForbiddenException("Bạn chỉ được quản lý bài tập của khóa học của mình");
    }
    return course;
  }

  private async loadAssignmentForOwner(id: string, actor: Actor) {
    const a = await this.prisma.assignment.findFirst({ where: { id, deletedAt: null }, select: { ...assignmentSelect } });
    if (!a) throw new NotFoundException("Không tìm thấy bài tập");
    const course = await this.assertCourseOwner(a.courseId, actor);
    return { assignment: a, course };
  }

  private async assertEnrolled(courseId: string, userId: string) {
    const e = await this.prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } }, select: { userId: true } });
    if (!e) throw new ForbiddenException("Bạn cần ghi danh khóa học để xem và nộp bài tập");
  }

  private async assertLessonInCourse(lessonId: string | null | undefined, courseId: string) {
    if (!lessonId) return;
    const l = await this.prisma.lesson.findFirst({ where: { id: lessonId, deletedAt: null, content: { courseId } }, select: { id: true } });
    if (!l) throw new BadRequestException("Bài học không thuộc khóa học này");
  }

  // ------------------------------------------------------------ giảng viên
  async create(courseId: string, actor: Actor, body: CreateAssignmentBody) {
    await this.assertCourseOwner(courseId, actor);
    await this.assertLessonInCourse(body.lessonId, courseId);
    return this.prisma.assignment.create({
      data: {
        courseId,
        lessonId: body.lessonId ?? null,
        title: body.title,
        description: body.description,
        dueAt: body.dueAt ?? null,
        maxScore: body.maxScore,
        allowLate: body.allowLate,
        isPublished: body.isPublished,
        createdById: actor.userId,
      },
      select: assignmentSelect,
    });
  }

  async listForInstructor(courseId: string, actor: Actor) {
    await this.assertCourseOwner(courseId, actor);
    const rows = await this.prisma.assignment.findMany({
      where: { courseId, deletedAt: null },
      select: { ...assignmentSelect, submissions: { select: { status: true } } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(({ submissions, ...a }) => ({
      ...a,
      submissionCount: submissions.length,
      pendingCount: submissions.filter((s) => s.status === "SUBMITTED").length,
      gradedCount: submissions.filter((s) => s.status === "GRADED").length,
    }));
  }

  async update(id: string, actor: Actor, body: UpdateAssignmentBody) {
    const { assignment } = await this.loadAssignmentForOwner(id, actor);
    await this.assertLessonInCourse(body.lessonId, assignment.courseId);
    return this.prisma.assignment.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.dueAt !== undefined ? { dueAt: body.dueAt } : {}),
        ...(body.maxScore !== undefined ? { maxScore: body.maxScore } : {}),
        ...(body.allowLate !== undefined ? { allowLate: body.allowLate } : {}),
        ...(body.isPublished !== undefined ? { isPublished: body.isPublished } : {}),
        ...(body.lessonId !== undefined ? { lessonId: body.lessonId } : {}),
      },
      select: assignmentSelect,
    });
  }

  async remove(id: string, actor: Actor) {
    await this.loadAssignmentForOwner(id, actor);
    // Xoá mềm để không mất bài nộp và điểm đã chấm
    await this.prisma.assignment.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  async listSubmissions(id: string, actor: Actor, q: ListSubmissionsQuery) {
    const { assignment } = await this.loadAssignmentForOwner(id, actor);
    const where: Prisma.SubmissionWhereInput = { assignmentId: id, ...(q.status ? { status: q.status } : {}) };
    const [total, data] = await Promise.all([
      this.prisma.submission.count({ where }),
      this.prisma.submission.findMany({
        where,
        select: { ...submissionSelect, user: { select: { id: true, name: true, avatar: true } } },
        orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
    ]);
    return { assignment, data, total, page: q.page, limit: q.limit, totalPages: Math.max(1, Math.ceil(total / q.limit)) };
  }

  /** Chấm điểm hoặc trả lại yêu cầu sửa. Điểm không vượt quá điểm tối đa của bài. */
  async grade(submissionId: string, actor: Actor, body: GradeBody) {
    const sub = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      select: { id: true, userId: true, assignment: { select: { id: true, courseId: true, title: true, maxScore: true, deletedAt: true } }, user: { select: { email: true, name: true } } },
    });
    if (!sub || sub.assignment.deletedAt) throw new NotFoundException("Không tìm thấy bài nộp");
    await this.assertCourseOwner(sub.assignment.courseId, actor);

    if (body.returnForRevision) {
      if (!body.feedback || body.feedback.length < 5) throw new BadRequestException("Hãy ghi nhận xét để học viên biết cần sửa gì");
    } else {
      if (body.score === undefined) throw new BadRequestException("Hãy nhập điểm");
      if (body.score > sub.assignment.maxScore) throw new BadRequestException(`Điểm tối đa của bài là ${sub.assignment.maxScore}`);
    }

    const now = new Date();
    const updated = await this.prisma.submission.update({
      where: { id: submissionId },
      data: body.returnForRevision
        ? { status: "RETURNED", score: null, feedback: body.feedback ?? null, gradedById: actor.userId, gradedAt: now }
        : { status: "GRADED", score: body.score, feedback: body.feedback ?? null, gradedById: actor.userId, gradedAt: now },
      select: submissionSelect,
    });

    const title = body.returnForRevision ? "Bài nộp cần chỉnh sửa" : "Bài nộp đã được chấm điểm";
    const message = body.returnForRevision
      ? `Giảng viên yêu cầu bạn sửa bài "${sub.assignment.title}".`
      : `Bài "${sub.assignment.title}" của bạn được ${body.score}/${sub.assignment.maxScore} điểm.`;
    await this.notifyStudent(sub, updated.id, now, title, message, body, sub.assignment.title, sub.assignment.maxScore);
    return updated;
  }

  // -------------------------------------------------------------- học viên
  async listForStudent(courseId: string, userId: string) {
    await this.assertEnrolled(courseId, userId);
    const rows = await this.prisma.assignment.findMany({
      where: { courseId, deletedAt: null, isPublished: true },
      select: { ...assignmentSelect, submissions: { where: { userId }, select: { status: true, score: true, isLate: true, submittedAt: true } } },
      orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    });
    return rows.map(({ submissions, ...a }) => ({ ...a, mySubmission: submissions[0] ?? null }));
  }

  /** Mọi bài tập của các khóa tôi đã ghi danh (trang "Bài tập của tôi"). */
  async myAssignments(userId: string) {
    const rows = await this.prisma.assignment.findMany({
      where: { deletedAt: null, isPublished: true, course: { deletedAt: null, enrollments: { some: { userId } } } },
      select: { ...assignmentSelect, course: { select: { id: true, title: true } }, submissions: { where: { userId }, select: { status: true, score: true, isLate: true, submittedAt: true } } },
      orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
      take: 200,
    });
    return rows.map(({ submissions, ...a }) => ({ ...a, mySubmission: submissions[0] ?? null }));
  }

  async getOne(id: string, userId: string) {
    const a = await this.prisma.assignment.findFirst({ where: { id, deletedAt: null, isPublished: true }, select: assignmentSelect });
    if (!a) throw new NotFoundException("Không tìm thấy bài tập");
    await this.assertEnrolled(a.courseId, userId);
    const mySubmission = await this.prisma.submission.findUnique({ where: { assignmentId_userId: { assignmentId: id, userId } }, select: submissionSelect });
    return { ...a, mySubmission };
  }

  /** Nộp hoặc nộp lại. Đã được chấm điểm thì khóa; quá hạn mà không cho nộp trễ thì từ chối. */
  async submit(id: string, userId: string, body: SubmitBody) {
    const a = await this.prisma.assignment.findFirst({
      where: { id, deletedAt: null, isPublished: true },
      select: { id: true, courseId: true, title: true, dueAt: true, allowLate: true, course: { select: { instructorId: true } } },
    });
    if (!a) throw new NotFoundException("Không tìm thấy bài tập");
    await this.assertEnrolled(a.courseId, userId);

    const late = !!a.dueAt && Date.now() > a.dueAt.getTime();
    if (late && !a.allowLate) throw new BadRequestException("Đã quá hạn nộp bài");

    const existing = await this.prisma.submission.findUnique({ where: { assignmentId_userId: { assignmentId: id, userId } }, select: { status: true } });
    if (existing?.status === "GRADED") throw new BadRequestException("Bài đã được chấm điểm nên không thể nộp lại");

    const data = {
      textContent: body.textContent || null,
      fileUrl: body.fileUrl || null,
      fileName: body.fileUrl ? body.fileName || null : null,
      status: "SUBMITTED" as const,
      isLate: late,
      submittedAt: new Date(),
    };
    const saved = await this.prisma.submission.upsert({
      where: { assignmentId_userId: { assignmentId: id, userId } },
      create: { assignmentId: id, userId, ...data },
      update: data,
      select: submissionSelect,
    });

    try {
      const student = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      await this.notifications.create({
        userId: a.course.instructorId,
        type: "SYSTEM",
        title: existing ? "Học viên nộp lại bài" : "Có bài nộp mới",
        message: `${student?.name ?? "Học viên"} vừa ${existing ? "nộp lại" : "nộp"} bài "${a.title}".`,
        data: { kind: "assignment-submission", assignmentId: id, submissionId: saved.id, courseId: a.courseId },
        courseId: a.courseId,
      });
    } catch (error) {
      this.logger.warn(`Không gửi được thông báo bài nộp: ${error}`);
    }
    return saved;
  }

  // ---------------------------------------------------------------- nội bộ
  private async notifyStudent(
    sub: { userId: string; user: { email: string; name: string }; assignment: { courseId: string } },
    submissionId: string,
    gradedAt: Date,
    title: string,
    message: string,
    body: GradeBody,
    assignmentTitle: string,
    maxScore: number,
  ) {
    try {
      await this.notifications.create({
        userId: sub.userId,
        type: "SYSTEM",
        title,
        message,
        data: { kind: "assignment-graded", submissionId, courseId: sub.assignment.courseId },
        courseId: sub.assignment.courseId,
      });
      const lines = [`Xin chào {{name}},`, "", message];
      if (!body.returnForRevision) lines.push("", `**Điểm: ${body.score}/${maxScore}**`);
      if (body.feedback) lines.push("", "**Nhận xét của giảng viên:**", "", body.feedback);
      lines.push("", `[Xem chi tiết](${publicUrl()}/learn/course/${sub.assignment.courseId})`);
      await this.mail.sendNotice({
        to: sub.user.email,
        name: sub.user.name,
        subject: `${title}: ${assignmentTitle}`,
        markdown: lines.join("\n"),
        idempotencyKey: `assignment-graded-${submissionId}-${gradedAt.getTime()}`,
      });
    } catch (error) {
      // Thông báo lỗi không được làm hỏng việc chấm điểm đã lưu
      this.logger.warn(`Không gửi được thông báo chấm bài: ${error}`);
    }
  }
}
