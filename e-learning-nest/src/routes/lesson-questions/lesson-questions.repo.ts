import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import {
  CreateLessonAnswerBody,
  CreateLessonQuestionBody,
  GetLessonQuestionsQuery,
} from "./lesson-questions.model";

const userSelect = { id: true, name: true, avatar: true } as const;

const answerSelect = {
  id: true,
  questionId: true,
  userId: true,
  content: true,
  isInstructorAnswer: true,
  createdAt: true,
  user: { select: userSelect },
} as const;

const questionSelect = {
  id: true,
  userId: true,
  lessonId: true,
  title: true,
  content: true,
  isResolved: true,
  createdAt: true,
  updatedAt: true,
  user: { select: userSelect },
  answers: { select: answerSelect, orderBy: { createdAt: "asc" as const } },
} as const;

@Injectable()
export class LessonQuestionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Trả về instructorId của khóa học chứa lesson, đồng thời xác nhận user có quyền truy cập (đã ghi danh hoặc là giảng viên). */
  async ensureLessonAccess(lessonId: string, userId: string) {
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
    const instructorId = lesson.content.course.instructorId;
    if (instructorId === userId) return { courseId, instructorId };

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    });
    if (!enrollment) {
      throw new ForbiddenException("You are not enrolled in this course");
    }
    return { courseId, instructorId };
  }

  async getQuestions(lessonId: string, userId: string, query: GetLessonQuestionsQuery) {
    await this.ensureLessonAccess(lessonId, userId);
    const { page, limit } = query;

    const [data, total] = await Promise.all([
      this.prisma.lessonQuestion.findMany({
        where: { lessonId },
        select: questionSelect,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.lessonQuestion.count({ where: { lessonId } }),
    ]);

    return {
      data: data.map((q) => ({ ...q, answerCount: q.answers.length })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createQuestion(lessonId: string, userId: string, body: CreateLessonQuestionBody) {
    const { instructorId } = await this.ensureLessonAccess(lessonId, userId);
    const created = await this.prisma.lessonQuestion.create({
      data: { lessonId, userId, title: body.title, content: body.content },
      select: questionSelect,
    });
    return { question: { ...created, answerCount: 0 }, instructorId };
  }

  async createAnswer(questionId: string, userId: string, body: CreateLessonAnswerBody) {
    const question = await this.prisma.lessonQuestion.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        lessonId: true,
        userId: true,
        lesson: { select: { content: { select: { courseId: true, course: { select: { instructorId: true } } } } } },
      },
    });
    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    const instructorId = question.lesson.content.course.instructorId;
    const courseId = question.lesson.content.courseId;
    const isInstructor = instructorId === userId;
    if (!isInstructor) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
        select: { id: true },
      });
      if (!enrollment) {
        throw new ForbiddenException("You are not enrolled in this course");
      }
    }

    const answer = await this.prisma.lessonAnswer.create({
      data: {
        questionId,
        userId,
        content: body.content,
        isInstructorAnswer: isInstructor,
      },
      select: answerSelect,
    });

    return { answer, questionAuthorId: question.userId, lessonId: question.lessonId };
  }

  async resolveQuestion(questionId: string, userId: string) {
    const question = await this.prisma.lessonQuestion.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        userId: true,
        lesson: { select: { content: { select: { course: { select: { instructorId: true } } } } } },
      },
    });
    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }
    const instructorId = question.lesson.content.course.instructorId;
    if (question.userId !== userId && instructorId !== userId) {
      throw new ForbiddenException("You cannot resolve this question");
    }

    return this.prisma.lessonQuestion.update({
      where: { id: questionId },
      data: { isResolved: true },
      select: questionSelect,
    });
  }

  async deleteQuestion(questionId: string, userId: string) {
    const question = await this.prisma.lessonQuestion.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        userId: true,
        lesson: { select: { content: { select: { course: { select: { instructorId: true } } } } } },
      },
    });
    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }
    const instructorId = question.lesson.content.course.instructorId;
    if (question.userId !== userId && instructorId !== userId) {
      throw new ForbiddenException("You cannot delete this question");
    }

    await this.prisma.lessonQuestion.delete({ where: { id: questionId } });
    return { success: true };
  }
}
