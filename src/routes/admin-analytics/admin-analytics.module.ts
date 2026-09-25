import { Module } from "@nestjs/common";
import { AdminAnalyticsController } from "./admin-analytics.controller";
import { AdminAnalyticsService } from "./admin-analytics.service";
import { AdminAnalyticsRepo } from "./admin-analytics.repo";
import { AdminExportService } from "./admin-export.service";

@Module({
  controllers: [AdminAnalyticsController],
  providers: [AdminAnalyticsService, AdminAnalyticsRepo, AdminExportService],
})
export class AdminAnalyticsModule {}
