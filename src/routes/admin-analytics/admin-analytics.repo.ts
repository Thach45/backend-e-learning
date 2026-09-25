import { Injectable } from "@nestjs/common";
import { CourseStatus, Prisma, ReportStatus } from "@prisma/client";
import { PrismaService } from "src/shared/service/prisma.service";
import { CourseAnalyticsQuery, InstructorAnalyticsQuery } from "./admin-analytics.model";

const round = (n: number, digits = 1) => Math.round(n * 10 ** digits) / 10 ** digits;
const rate = (part: number, whole: number) => (whole > 0 ? round((part / whole) * 100) : 0);

export type CourseAnalyticsRow = {
  courseId: string;
  title: string;
  instructorName: string;
  enrollments: number;
  completedLearners: number;
  completionRate: number;
  avgRating: number;
  reviewCount: number;
  avgSatisfaction: number;
  avgDifficulty: number;
  recommendRate: number;
  surveyCount: number;
  quizAttempts: number;
  quizPassRate: number;
  questions: number;
  unansweredQuestions: number;
};

export type InstructorAnalyticsRow = {
  instructorId: string;
  name: string;
  email: string;
  courses: number;
  students: number;
  avgRating: number;
  reviewCount: number;
  followers: number;
};

@Injectable()
export class AdminAnalyticsRepo {
  constructor(private readonly prisma: PrismaService) {}

  /** Tổng quan toàn nền tảng (không gồm số liệu tiền bạc). */
  async getOverview() {
    const [
      pendingReports,
      totalComments,
      totalQuestions,
      unansweredQuestions,
      quizAttempts,
      quizPassed,
      badgesAwarded,
      ratingAgg,
      surveyAgg,
      surveyRecommend,
      newUsers7d,
      activeLearners7d,
      publishedCourses,
      pendingCourses,
    ] = await Promise.all([
      this.prisma.contentReport.count({ where: { status: ReportStatus.PENDING } }),
      this.prisma.comment.count(),
      this.prisma.lessonQuestion.count(),
      this.prisma.lessonQuestion.count({ where: { answers: { none: {} } } }),
      this.prisma.quizAttempt.count(),
      this.prisma.quizAttempt.count({ where: { passed: true } }),
      this.prisma.userBadge.count(),
      this.prisma.review.aggregate({ _avg: { rating: true }, _count: true }),
      this.prisma.courseSurveyResponse.aggregate({
        _avg: { satisfactionRating: true, difficultyRating: true },
        _count: true,
      }),
      this.prisma.courseSurveyResponse.count({ where: { wouldRecommend: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) }, deletedAt: null } }),
      this.prisma.learningProgress
        .groupBy({ by: ["userId"], where: { lastAccessed: { gte: new Date(Date.now() - 7 * 86400000) } } })
        .then((rows) => rows.length),
      this.prisma.course.count({ where: { status: CourseStatus.PUBLISHED, deletedAt: null } }),
      this.prisma.course.count({
        where: { status: { in: [CourseStatus.PENDING_PUBLISHED, CourseStatus.PENDING_DRAFT] }, deletedAt: null },
      }),
    ]);

    return {
      pendingReports,
      publishedCourses,
      pendingCourses,
      newUsers7d,
      activeLearners7d,
      totalComments,
      totalQuestions,
      unansweredQuestions,
      quizAttempts,
      quizPassRate: rate(quizPassed, quizAttempts),
      badgesAwarded,
      avgRating: round(ratingAgg._avg.rating ?? 0, 2),
      reviewCount: ratingAgg._count,
      avgSatisfaction: round(surveyAgg._avg.satisfactionRating ?? 0, 2),
      avgDifficulty: round(surveyAgg._avg.difficultyRating ?? 0, 2),
      recommendRate: rate(surveyRecommend, surveyAgg._count),
      surveyCount: surveyAgg._count,
    };
  }

  /** Số liệu từng khóa học; tính toàn bộ bằng vài truy vấn gom nhóm rồi sắp xếp/phân trang trong bộ nhớ. */
  async getCourseRows(search?: string): Promise<CourseAnalyticsRow[]> {
    const courses = await this.prisma.course.findMany({
      where: {
        deletedAt: null,
        status: CourseStatus.PUBLISHED,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { instructor: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
              ],
            }
          : {}),
      },
      select: { id: true, title: true, instructor: { select: { name: true } } },
    });
    if (courses.length === 0) return [];
    const ids = courses.map((c) => c.id);

    const [enrollments, reviews, surveys, recommends, completions, quizzes, questions] = await Promise.all([
      this.prisma.enrollment.groupBy({ by: ["courseId"], where: { courseId: { in: ids } }, _count: { _all: true } }),
      this.prisma.review.groupBy({
        by: ["courseId"],
        where: { courseId: { in: ids } },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      this.prisma.courseSurveyResponse.groupBy({
        by: ["courseId"],
        where: { courseId: { in: ids } },
        _avg: { satisfactionRating: true, difficultyRating: true },
        _count: { _all: true },
      }),
      this.prisma.courseSurveyResponse.groupBy({
        by: ["courseId"],
        where: { courseId: { in: ids }, wouldRecommend: true },
        _count: { _all: true },
      }),
      // Học viên đã hoàn thành 100% mọi bài học đang hoạt động của khóa
      this.prisma.$queryRaw<{ courseId: string; completed: number }[]>`
        SELECT t."courseId", COUNT(*)::int AS completed
        FROM (
          SELECT "userId", "courseId", COUNT(*) FILTER (WHERE "progressPercent" = 100) AS done
          FROM "LearningProgress" GROUP BY "userId", "courseId"
        ) lp
        JOIN (
          SELECT cc."courseId", COUNT(l.id) AS total
          FROM "Lesson" l JOIN "CourseContent" cc ON cc.id = l."contentId"
          WHERE l."deletedAt" IS NULL AND l."isActive" AND cc."deletedAt" IS NULL AND cc."isActive"
          GROUP BY cc."courseId"
        ) t ON t."courseId" = lp."courseId"
        WHERE t.total > 0 AND lp.done >= t.total
        GROUP BY t."courseId"`,
      this.prisma.$queryRaw<{ courseId: string; attempts: number; passed: number }[]>`
        SELECT cc."courseId", COUNT(qa.id)::int AS attempts, (COUNT(qa.id) FILTER (WHERE qa.passed))::int AS passed
        FROM "QuizAttempt" qa
        JOIN "Quiz" q ON q.id = qa."quizId"
        JOIN "Lesson" l ON l.id = q."lessonId"
        JOIN "CourseContent" cc ON cc.id = l."contentId"
        GROUP BY cc."courseId"`,
      this.prisma.$queryRaw<{ courseId: string; total: number; unanswered: number }[]>`
        SELECT cc."courseId", COUNT(lq.id)::int AS total,
               (COUNT(lq.id) FILTER (WHERE NOT EXISTS (SELECT 1 FROM "LessonAnswer" la WHERE la."questionId" = lq.id)))::int AS unanswered
        FROM "LessonQuestion" lq
        JOIN "Lesson" l ON l.id = lq."lessonId"
        JOIN "CourseContent" cc ON cc.id = l."contentId"
        GROUP BY cc."courseId"`,
    ]);

    const by = <T extends { courseId: string }>(rows: T[]) => new Map(rows.map((r) => [r.courseId, r]));
    const enrollmentMap = by(enrollments);
    const reviewMap = by(reviews);
    const surveyMap = by(surveys);
    const recommendMap = by(recommends);
    const completionMap = by(completions);
    const quizMap = by(quizzes);
    const questionMap = by(questions);

    return courses.map((c) => {
      const enrolled = enrollmentMap.get(c.id)?._count._all ?? 0;
      const completed = completionMap.get(c.id)?.completed ?? 0;
      const survey = surveyMap.get(c.id);
      const quiz = quizMap.get(c.id);
      const question = questionMap.get(c.id);
      return {
        courseId: c.id,
        title: c.title,
        instructorName: c.instructor.name,
        enrollments: enrolled,
        completedLearners: completed,
        completionRate: rate(completed, enrolled),
        avgRating: round(reviewMap.get(c.id)?._avg.rating ?? 0, 2),
        reviewCount: reviewMap.get(c.id)?._count._all ?? 0,
        avgSatisfaction: round(survey?._avg.satisfactionRating ?? 0, 2),
        avgDifficulty: round(survey?._avg.difficultyRating ?? 0, 2),
        recommendRate: rate(recommendMap.get(c.id)?._count._all ?? 0, survey?._count._all ?? 0),
        surveyCount: survey?._count._all ?? 0,
        quizAttempts: quiz?.attempts ?? 0,
        quizPassRate: rate(quiz?.passed ?? 0, quiz?.attempts ?? 0),
        questions: question?.total ?? 0,
        unansweredQuestions: question?.unanswered ?? 0,
      };
    });
  }

  async getInstructorRows(search?: string): Promise<InstructorAnalyticsRow[]> {
    const instructors = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        instructorCourses: { some: { deletedAt: null, status: CourseStatus.PUBLISHED } },
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
              ],
            }
          : {}),
      },
      select: { id: true, name: true, email: true },
    });
    if (instructors.length === 0) return [];
    const ids = instructors.map((i) => i.id);

    const [courses, students, reviews, followers] = await Promise.all([
      this.prisma.course.groupBy({
        by: ["instructorId"],
        where: { instructorId: { in: ids }, deletedAt: null, status: CourseStatus.PUBLISHED },
        _count: { _all: true },
      }),
      this.prisma.$queryRaw<{ instructorId: string; students: number }[]>`
        SELECT c."instructorId", COUNT(DISTINCT e."userId")::int AS students
        FROM "Enrollment" e JOIN "Course" c ON c.id = e."courseId"
        WHERE c."instructorId" = ANY(${ids}) AND c."deletedAt" IS NULL
        GROUP BY c."instructorId"`,
      this.prisma.$queryRaw<{ instructorId: string; avg: number; total: number }[]>`
        SELECT c."instructorId", AVG(r.rating)::float AS avg, COUNT(r.id)::int AS total
        FROM "Review" r JOIN "Course" c ON c.id = r."courseId"
        WHERE c."instructorId" = ANY(${ids}) AND c."deletedAt" IS NULL
        GROUP BY c."instructorId"`,
      this.prisma.instructorFollow.groupBy({
        by: ["instructorId"],
        where: { instructorId: { in: ids } },
        _count: { _all: true },
      }),
    ]);

    const courseMap = new Map(courses.map((r) => [r.instructorId, r._count._all]));
    const studentMap = new Map(students.map((r) => [r.instructorId, r.students]));
    const reviewMap = new Map(reviews.map((r) => [r.instructorId, r]));
    const followerMap = new Map(followers.map((r) => [r.instructorId, r._count._all]));

    return instructors.map((i) => ({
      instructorId: i.id,
      name: i.name,
      email: i.email,
      courses: courseMap.get(i.id) ?? 0,
      students: studentMap.get(i.id) ?? 0,
      avgRating: round(reviewMap.get(i.id)?.avg ?? 0, 2),
      reviewCount: reviewMap.get(i.id)?.total ?? 0,
      followers: followerMap.get(i.id) ?? 0,
    }));
  }

  sortAndPage<T extends Record<string, any>>(
    rows: T[],
    query: Pick<CourseAnalyticsQuery | InstructorAnalyticsQuery, "page" | "limit" | "order"> & { sortBy: string },
    sortKey: (sortBy: string) => keyof T,
  ) {
    const key = sortKey(query.sortBy);
    const dir = query.order === "asc" ? 1 : -1;
    const sorted = [...rows].sort((a, b) => (Number(a[key]) - Number(b[key])) * dir);
    const start = (Math.max(query.page, 1) - 1) * query.limit;
    return {
      data: sorted.slice(start, start + Number(query.limit)),
      total: rows.length,
      page: query.page,
      limit: Number(query.limit),
      totalPages: Math.ceil(rows.length / query.limit),
    };
  }
}
