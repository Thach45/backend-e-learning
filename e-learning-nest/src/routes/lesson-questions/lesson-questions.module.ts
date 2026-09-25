import { Module } from "@nestjs/common";
import { LessonQuestionsController } from "./lesson-questions.controller";
import { LessonQuestionsService } from "./lesson-questions.service";
import { LessonQuestionsRepository } from "./lesson-questions.repo";
import { NotificationsModule } from "src/routes/notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [LessonQuestionsController],
  providers: [LessonQuestionsService, LessonQuestionsRepository],
})
export class LessonQuestionsModule {}
