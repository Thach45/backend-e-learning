import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { NotificationsRepository } from "./notifications.repo";
import { SharedModule } from "src/shared/shared.module";
import { RealtimeModule } from "src/realtime/core/realtime.module";

@Module({
  imports: [SharedModule, RealtimeModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository],
  exports: [NotificationsService],
})
export class NotificationsModule {}
