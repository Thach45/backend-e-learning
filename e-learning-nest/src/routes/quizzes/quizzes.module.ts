import { Module } from "@nestjs/common";
import { QuizzesController } from "./quizzes.controller";
import { QuizzesService } from "./quizzes.service";
import { QuizzesRepository } from "./quizzes.repo";

@Module({
  controllers: [QuizzesController],
  providers: [QuizzesService, QuizzesRepository],
})
export class QuizzesModule {}
