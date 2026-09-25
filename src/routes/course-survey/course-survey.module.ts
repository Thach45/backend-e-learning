import { Module } from "@nestjs/common";
import { CourseSurveyController } from "./course-survey.controller";
import { CourseSurveyService } from "./course-survey.service";
import { CourseSurveyRepository } from "./course-survey.repo";

@Module({
  controllers: [CourseSurveyController],
  providers: [CourseSurveyService, CourseSurveyRepository],
})
export class CourseSurveyModule {}
