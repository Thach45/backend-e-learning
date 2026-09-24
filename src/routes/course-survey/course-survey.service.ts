import { Injectable } from "@nestjs/common";
import { CourseSurveyRepository } from "./course-survey.repo";
import { SubmitSurveyBody } from "./course-survey.model";

@Injectable()
export class CourseSurveyService {
  constructor(private readonly repo: CourseSurveyRepository) {}

  async getMySurvey(courseId: string, userId: string) {
    const survey = await this.repo.getMySurvey(courseId, userId);
    return { survey };
  }

  async submitSurvey(courseId: string, userId: string, body: SubmitSurveyBody) {
    const survey = await this.repo.submitSurvey(courseId, userId, body);
    return { survey };
  }

  async getSurveyResults(instructorId: string, courseId: string) {
    return this.repo.getSurveyResults(instructorId, courseId);
  }
}
