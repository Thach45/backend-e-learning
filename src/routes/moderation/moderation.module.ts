import { Module } from "@nestjs/common";
import { ModerationController } from "./moderation.controller";
import { ModerationService } from "./moderation.service";
import { ModerationRepo } from "./moderation.repo";

@Module({
  controllers: [ModerationController],
  providers: [ModerationService, ModerationRepo],
})
export class ModerationModule {}
