import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { SubmitSurveyBody } from "./course-survey.model";

const surveySelect = {
  id: true,
  userId: true,
  courseId: true,
  difficultyRating: true,
  satisfactionRating: true,
  wouldRecommend: true,
  feedback: true,
  createdAt: true,
} as const;

@Injectable()
export class CourseSurveyRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureCompletedEnrollment(courseId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true, completedAt: true },
    });
    if (!enrollment) {
      throw new NotFoundException("You are not enrolled in this course");
    }
    return enrollment;
  }

  async getMySurvey(courseId: string, userId: string) {
    await this.ensureCompletedEnrollment(courseId, userId);
    return this.prisma.courseSurveyResponse.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: surveySelect,
    });
  }

  async submitSurvey(courseId: string, userId: string, body: SubmitSurveyBody) {
    const enrollment = await this.ensureCompletedEnrollment(courseId, userId);
    if (!enrollment.completedAt) {
      throw new ForbiddenException("You can only submit a survey after completing the course");
    }

    return this.prisma.courseSurveyResponse.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {
        difficultyRating: body.difficultyRating,
        satisfactionRating: body.satisfactionRating,
        wouldRecommend: body.wouldRecommend,
        feedback: body.feedback ?? null,
      },
      create: {
        userId,
        courseId,
        difficultyRating: body.difficultyRating,
        satisfactionRating: body.satisfactionRating,
        wouldRecommend: body.wouldRecommend,
        feedback: body.feedback ?? null,
      },
      select: surveySelect,
    });
  }

  async getSurveyResults(instructorId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new ForbiddenException("You can only view survey results for your own courses");
    }

    const responses = await this.prisma.courseSurveyResponse.findMany({
      where: { courseId },
      select: {
        id: true,
        difficultyRating: true,
        satisfactionRating: true,
        wouldRecommend: true,
        feedback: true,
        createdAt: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalResponses = responses.length;
    const averageDifficulty = totalResponses > 0
      ? Math.round((responses.reduce((sum, r) => sum + r.difficultyRating, 0) / totalResponses) * 100) / 100
      : 0;
    const averageSatisfaction = totalResponses > 0
      ? Math.round((responses.reduce((sum, r) => sum + r.satisfactionRating, 0) / totalResponses) * 100) / 100
      : 0;
    const recommendPercent = totalResponses > 0
      ? Math.round((responses.filter((r) => r.wouldRecommend).length / totalResponses) * 100 * 100) / 100
      : 0;

    return {
      courseId,
      totalResponses,
      averageDifficulty,
      averageSatisfaction,
      recommendPercent,
      feedback: responses.map((r) => ({
        id: r.id,
        userName: r.user.name,
        difficultyRating: r.difficultyRating,
        satisfactionRating: r.satisfactionRating,
        wouldRecommend: r.wouldRecommend,
        feedback: r.feedback,
        createdAt: r.createdAt,
      })),
    };
  }
}
