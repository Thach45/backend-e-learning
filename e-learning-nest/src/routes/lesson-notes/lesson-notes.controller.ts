import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { LessonNotesService } from "./lesson-notes.service";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import {
  GetLessonNotesParamsDto,
  LessonNoteParamsDto,
  CreateLessonNoteBodyDto,
  UpdateLessonNoteBodyDto,
  LessonNoteResponseDto,
  GetLessonNotesResponseDto,
} from "./lesson-notes.dto";

@Controller("api")
export class LessonNotesController {
  constructor(private readonly service: LessonNotesService) {}

  @Get("lessons/:lessonId/notes")
  @ZodSerializerDto(GetLessonNotesResponseDto)
  async getNotes(@Param() params: GetLessonNotesParamsDto, @ActiveUser() user: any) {
    return this.service.getNotes(params.lessonId, user.userId);
  }

  @Post("lessons/:lessonId/notes")
  @ZodSerializerDto(LessonNoteResponseDto)
  async createNote(
    @Param() params: GetLessonNotesParamsDto,
    @Body() body: CreateLessonNoteBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.service.createNote(params.lessonId, user.userId, body);
  }

  @Put("lesson-notes/:noteId")
  @ZodSerializerDto(LessonNoteResponseDto)
  async updateNote(
    @Param() params: LessonNoteParamsDto,
    @Body() body: UpdateLessonNoteBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.service.updateNote(params.noteId, user.userId, body);
  }

  @Delete("lesson-notes/:noteId")
  async deleteNote(@Param() params: LessonNoteParamsDto, @ActiveUser() user: any) {
    return this.service.deleteNote(params.noteId, user.userId);
  }
}
