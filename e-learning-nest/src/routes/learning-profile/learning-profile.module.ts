import { Module } from "@nestjs/common";
import { LearningProfileController } from "./learning-profile.controller";
import { LearningProfileService } from "./learning-profile.service";

@Module({
  controllers: [LearningProfileController],
  providers: [LearningProfileService],
})
export class LearningProfileModule {}
