import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { CourseSurveyService } from "./course-survey.service";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import {
  CourseIdParamsDto,
  SubmitSurveyBodyDto,
  SurveyOrNullResponseDto,
  SurveyResultsResponseDto,
} from "./course-survey.dto";

@Controller("api")
export class CourseSurveyController {
  constructor(private readonly service: CourseSurveyService) {}

  @Get("my-enrollments/:courseId/survey")
  @ZodSerializerDto(SurveyOrNullResponseDto)
  async getMySurvey(@Param() params: CourseIdParamsDto, @ActiveUser() user: any) {
    return this.service.getMySurvey(params.courseId, user.userId);
  }

  @Post("my-enrollments/:courseId/survey")
  @ZodSerializerDto(SurveyOrNullResponseDto)
  async submitSurvey(
    @Param() params: CourseIdParamsDto,
    @Body() body: SubmitSurveyBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.service.submitSurvey(params.courseId, user.userId, body);
  }

  @Get("instructor/courses/:courseId/survey-results")
  @ZodSerializerDto(SurveyResultsResponseDto)
  async getSurveyResults(@Param() params: CourseIdParamsDto, @ActiveUser() user: any) {
    return this.service.getSurveyResults(user.userId, params.courseId);
  }
}
