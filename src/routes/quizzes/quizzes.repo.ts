import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { SubmitQuizBody, UpsertQuizBody } from "./quizzes.model";

const fullQuestionSelect = {
  id: true,
  text: true,
  orderIndex: true,
  options: {
    select: { id: true, text: true, isCorrect: true },
  },
} as const;

const publicQuestionSelect = {
  id: true,
  text: true,
  orderIndex: true,
  options: {
    select: { id: true, text: true },
  },
} as const;

@Injectable()
export class QuizzesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureInstructorOwnsLesson(lessonId: string, instructorId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, deletedAt: null },
      select: { id: true, content: { select: { course: { select: { instructorId: true } } } } },
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }
    if (lesson.content.course.instructorId !== instructorId) {
      throw new ForbiddenException("You can only manage quizzes for your own courses");
    }
  }

  private async ensureEnrolled(lessonId: string, userId: string) {
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
    if (lesson.content.course.instructorId === userId) return;

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.content.courseId } },
      select: { id: true },
    });
    if (!enrollment) {
      throw new ForbiddenException("You are not enrolled in this course");
    }
  }

  async getQuizForInstructor(lessonId: string, instructorId: string) {
    await this.ensureInstructorOwnsLesson(lessonId, instructorId);
    return this.prisma.quiz.findUnique({
      where: { lessonId },
      select: {
        id: true,
        lessonId: true,
        title: true,
        passingScore: true,
        createdAt: true,
        updatedAt: true,
        questions: { select: fullQuestionSelect, orderBy: { orderIndex: "asc" } },
      },
    });
  }

  async upsertQuiz(lessonId: string, instructorId: string, body: UpsertQuizBody) {
    await this.ensureInstructorOwnsLesson(lessonId, instructorId);

    for (const question of body.questions) {
      if (!question.options.some((o) => o.isCorrect)) {
        throw new BadRequestException(`Question "${question.text}" needs at least 1 correct option`);
      }
    }

    const existing = await this.prisma.quiz.findUnique({ where: { lessonId }, select: { id: true } });

    const questionsCreate = body.questions.map((q) => ({
      text: q.text,
      orderIndex: q.orderIndex,
      options: { create: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })) },
    }));

    if (existing) {
      await this.prisma.quiz.update({
        where: { id: existing.id },
        data: {
          title: body.title,
          passingScore: body.passingScore,
          questions: { deleteMany: {}, create: questionsCreate },
        },
      });
    } else {
      await this.prisma.quiz.create({
        data: {
          lessonId,
          title: body.title,
          passingScore: body.passingScore,
          questions: { create: questionsCreate },
        },
      });
    }

    return this.getQuizForInstructor(lessonId, instructorId);
  }

  async deleteQuiz(lessonId: string, instructorId: string) {
    await this.ensureInstructorOwnsLesson(lessonId, instructorId);
    const existing = await this.prisma.quiz.findUnique({ where: { lessonId }, select: { id: true } });
    if (!existing) {
      throw new NotFoundException(`Quiz for lesson ${lessonId} not found`);
    }
    await this.prisma.quiz.delete({ where: { id: existing.id } });
    return { success: true };
  }

  async getQuizForStudent(lessonId: string, userId: string) {
    await this.ensureEnrolled(lessonId, userId);
    return this.prisma.quiz.findUnique({
      where: { lessonId },
      select: {
        id: true,
        lessonId: true,
        title: true,
        passingScore: true,
        questions: { select: publicQuestionSelect, orderBy: { orderIndex: "asc" } },
      },
    });
  }

  async submitQuiz(lessonId: string, userId: string, body: SubmitQuizBody) {
    await this.ensureEnrolled(lessonId, userId);

    const quiz = await this.prisma.quiz.findUnique({
      where: { lessonId },
      select: {
        id: true,
        passingScore: true,
        questions: { select: fullQuestionSelect },
      },
    });
    if (!quiz) {
      throw new NotFoundException(`Quiz for lesson ${lessonId} not found`);
    }

    const answerByQuestionId = new Map(body.answers.map((a) => [a.questionId, a.optionId]));
    const correctOptionByQuestion: Record<string, string> = {};

    let correctCount = 0;
    for (const question of quiz.questions) {
      const correctOption = question.options.find((o) => o.isCorrect);
      if (correctOption) {
        correctOptionByQuestion[question.id] = correctOption.id;
      }

      const selectedOptionId = answerByQuestionId.get(question.id);
      if (selectedOptionId && correctOption && selectedOptionId === correctOption.id) {
        correctCount += 1;
      }
    }

    const scorePercent = quiz.questions.length > 0
      ? Math.round((correctCount / quiz.questions.length) * 100)
      : 0;
    const passed = scorePercent >= quiz.passingScore;

    const validAnswers = quiz.questions
      .map((question) => {
        const optionId = answerByQuestionId.get(question.id);
        if (!optionId) return null;
        const isValidOption = question.options.some((o) => o.id === optionId);
        if (!isValidOption) return null;
        return { questionId: question.id, optionId };
      })
      .filter((a): a is { questionId: string; optionId: string } => a !== null);

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        userId,
        scorePercent,
        passed,
        answers: { create: validAnswers },
      },
      select: { id: true, quizId: true, scorePercent: true, passed: true, submittedAt: true },
    });

    return { ...attempt, correctOptionByQuestion };
  }

  async getAttempts(lessonId: string, userId: string) {
    await this.ensureEnrolled(lessonId, userId);
    const quiz = await this.prisma.quiz.findUnique({ where: { lessonId }, select: { id: true } });
    if (!quiz) return [];

    return this.prisma.quizAttempt.findMany({
      where: { quizId: quiz.id, userId },
      select: { id: true, scorePercent: true, passed: true, submittedAt: true },
      orderBy: { submittedAt: "desc" },
    });
  }
}
