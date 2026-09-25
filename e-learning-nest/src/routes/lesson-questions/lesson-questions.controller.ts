import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { LessonQuestionsService } from "./lesson-questions.service";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import {
  GetLessonQuestionsParamsDto,
  QuestionParamsDto,
  GetLessonQuestionsQueryDto,
  CreateLessonQuestionBodyDto,
  CreateLessonAnswerBodyDto,
  LessonQuestionResponseDto,
  GetLessonQuestionsResponseDto,
} from "./lesson-questions.dto";

@Controller("api")
export class LessonQuestionsController {
  constructor(private readonly service: LessonQuestionsService) {}

  @Get("lessons/:lessonId/questions")
  @ZodSerializerDto(GetLessonQuestionsResponseDto)
  async getQuestions(
    @Param() params: GetLessonQuestionsParamsDto,
    @Query() query: GetLessonQuestionsQueryDto,
    @ActiveUser() user: any,
  ) {
    return this.service.getQuestions(params.lessonId, user.userId, query);
  }

  @Post("lessons/:lessonId/questions")
  @ZodSerializerDto(LessonQuestionResponseDto)
  async createQuestion(
    @Param() params: GetLessonQuestionsParamsDto,
    @Body() body: CreateLessonQuestionBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.service.createQuestion(params.lessonId, user.userId, body);
  }

  @Post("questions/:questionId/answers")
  async createAnswer(
    @Param() params: QuestionParamsDto,
    @Body() body: CreateLessonAnswerBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.service.createAnswer(params.questionId, user.userId, body);
  }

  @Patch("questions/:questionId/resolve")
  @ZodSerializerDto(LessonQuestionResponseDto)
  async resolveQuestion(@Param() params: QuestionParamsDto, @ActiveUser() user: any) {
    return this.service.resolveQuestion(params.questionId, user.userId);
  }

  @Delete("questions/:questionId")
  async deleteQuestion(@Param() params: QuestionParamsDto, @ActiveUser() user: any) {
    return this.service.deleteQuestion(params.questionId, user.userId);
  }
}
