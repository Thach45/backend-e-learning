import { Module } from "@nestjs/common";
import { GamificationController } from "./gamification.controller";
import { GamificationService } from "./gamification.service";
import { GamificationRepository } from "./gamification.repo";
import { SharedModule } from "src/shared/shared.module";

@Module({
  imports: [SharedModule],
  controllers: [GamificationController],
  providers: [GamificationService, GamificationRepository],
  exports: [GamificationService],
})
export class GamificationModule {}
