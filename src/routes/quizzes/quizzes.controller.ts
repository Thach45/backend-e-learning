import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { QuizzesService } from "./quizzes.service";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import {
  QuizLessonParamsDto,
  UpsertQuizBodyDto,
  SubmitQuizBodyDto,
  QuizOrNullResponseDto,
  QuizPublicOrNullResponseDto,
  QuizAttemptResultResponseDto,
  GetQuizAttemptsResponseDto,
} from "./quizzes.dto";

@Controller("api")
export class QuizzesController {
  constructor(private readonly service: QuizzesService) {}

  // Instructor endpoints
  @Get("instructor/lessons/:lessonId/quiz")
  @ZodSerializerDto(QuizOrNullResponseDto)
  async getQuizForInstructor(@Param() params: QuizLessonParamsDto, @ActiveUser() user: any) {
    return this.service.getQuizForInstructor(params.lessonId, user.userId);
  }

  @Put("instructor/lessons/:lessonId/quiz")
  @ZodSerializerDto(QuizOrNullResponseDto)
  async upsertQuiz(
    @Param() params: QuizLessonParamsDto,
    @Body() body: UpsertQuizBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.service.upsertQuiz(params.lessonId, user.userId, body);
  }

  @Delete("instructor/lessons/:lessonId/quiz")
  async deleteQuiz(@Param() params: QuizLessonParamsDto, @ActiveUser() user: any) {
    return this.service.deleteQuiz(params.lessonId, user.userId);
  }

  // Student endpoints
  @Get("lessons/:lessonId/quiz")
  @ZodSerializerDto(QuizPublicOrNullResponseDto)
  async getQuizForStudent(@Param() params: QuizLessonParamsDto, @ActiveUser() user: any) {
    return this.service.getQuizForStudent(params.lessonId, user.userId);
  }

  @Post("lessons/:lessonId/quiz/submit")
  @ZodSerializerDto(QuizAttemptResultResponseDto)
  async submitQuiz(
    @Param() params: QuizLessonParamsDto,
    @Body() body: SubmitQuizBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.service.submitQuiz(params.lessonId, user.userId, body);
  }

  @Get("lessons/:lessonId/quiz/attempts")
  @ZodSerializerDto(GetQuizAttemptsResponseDto)
  async getAttempts(@Param() params: QuizLessonParamsDto, @ActiveUser() user: any) {
    return this.service.getAttempts(params.lessonId, user.userId);
  }
}
