import { Module } from "@nestjs/common";
import { SiteSettingsController } from "./site-settings.controller";
import { SiteSettingsService } from "./site-settings.service";
import { MaintenanceGuard } from "./maintenance.guard";

@Module({
  controllers: [SiteSettingsController],
  providers: [SiteSettingsService, MaintenanceGuard],
  exports: [SiteSettingsService, MaintenanceGuard],
})
export class SiteSettingsModule {}
