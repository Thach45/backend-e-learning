import { Injectable } from "@nestjs/common";
import { QuizzesRepository } from "./quizzes.repo";
import { SubmitQuizBody, UpsertQuizBody } from "./quizzes.model";

@Injectable()
export class QuizzesService {
  constructor(private readonly repo: QuizzesRepository) {}

  async getQuizForInstructor(lessonId: string, instructorId: string) {
    const quiz = await this.repo.getQuizForInstructor(lessonId, instructorId);
    return { quiz };
  }

  async upsertQuiz(lessonId: string, instructorId: string, body: UpsertQuizBody) {
    const quiz = await this.repo.upsertQuiz(lessonId, instructorId, body);
    return { quiz };
  }

  async deleteQuiz(lessonId: string, instructorId: string) {
    return this.repo.deleteQuiz(lessonId, instructorId);
  }

  async getQuizForStudent(lessonId: string, userId: string) {
    const quiz = await this.repo.getQuizForStudent(lessonId, userId);
    return { quiz };
  }

  async submitQuiz(lessonId: string, userId: string, body: SubmitQuizBody) {
    return this.repo.submitQuiz(lessonId, userId, body);
  }

  async getAttempts(lessonId: string, userId: string) {
    return this.repo.getAttempts(lessonId, userId);
  }
}
