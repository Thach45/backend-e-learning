import { Module } from "@nestjs/common";
import { LessonNotesController } from "./lesson-notes.controller";
import { LessonNotesService } from "./lesson-notes.service";
import { LessonNotesRepository } from "./lesson-notes.repo";

@Module({
  controllers: [LessonNotesController],
  providers: [LessonNotesService, LessonNotesRepository],
})
export class LessonNotesModule {}
