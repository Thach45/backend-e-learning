import { Injectable, Logger } from "@nestjs/common";
import { LessonQuestionsRepository } from "./lesson-questions.repo";
import { NotificationsService } from "src/routes/notifications/notifications.service";
import {
  CreateLessonAnswerBody,
  CreateLessonQuestionBody,
  GetLessonQuestionsQuery,
} from "./lesson-questions.model";

@Injectable()
export class LessonQuestionsService {
  private readonly logger = new Logger(LessonQuestionsService.name);

  constructor(
    private readonly repo: LessonQuestionsRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getQuestions(lessonId: string, userId: string, query: GetLessonQuestionsQuery) {
    return this.repo.getQuestions(lessonId, userId, query);
  }

  async createQuestion(lessonId: string, userId: string, body: CreateLessonQuestionBody) {
    const { question, instructorId } = await this.repo.createQuestion(lessonId, userId, body);

    if (instructorId && instructorId !== userId) {
      try {
        await this.notificationsService.create({
          userId: instructorId,
          type: "NEW_QUESTION",
          title: "Có câu hỏi mới trong bài học",
          message: `${question.user?.name ?? "Một học viên"} đã đặt câu hỏi: "${question.title}"`,
          lessonId,
          data: { questionId: question.id },
        });
      } catch (error) {
        this.logger.warn(`Không thể tạo notification cho question ${question.id}: ${error}`);
      }
    }

    return question;
  }

  async createAnswer(questionId: string, userId: string, body: CreateLessonAnswerBody) {
    const { answer, questionAuthorId, lessonId } = await this.repo.createAnswer(questionId, userId, body);

    if (questionAuthorId && questionAuthorId !== userId) {
      try {
        await this.notificationsService.create({
          userId: questionAuthorId,
          type: "NEW_ANSWER",
          title: "Câu hỏi của bạn đã có câu trả lời",
          message: `${answer.user?.name ?? "Một thành viên"} đã trả lời câu hỏi của bạn`,
          lessonId,
          data: { questionId },
        });
      } catch (error) {
        this.logger.warn(`Không thể tạo notification cho answer ${answer.id}: ${error}`);
      }
    }

    return answer;
  }

  async resolveQuestion(questionId: string, userId: string) {
    return this.repo.resolveQuestion(questionId, userId);
  }

  async deleteQuestion(questionId: string, userId: string) {
    return this.repo.deleteQuestion(questionId, userId);
  }
}
