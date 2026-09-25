import { Module } from "@nestjs/common";
import { LessonResourcesController } from "./lesson-resources.controller";
import { LessonResourcesService } from "./lesson-resources.service";

@Module({ controllers: [LessonResourcesController], providers: [LessonResourcesService], exports: [LessonResourcesService] })
export class LessonResourcesModule {}
