import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { NotificationsModule } from "../notifications/notifications.module";
import { EMAIL_CAMPAIGN_QUEUE } from "./email-campaigns.constants";
import { CampaignAudienceService } from "./campaign-audience.service";
import { EmailCampaignsService } from "./email-campaigns.service";
import { EmailCampaignsController } from "./email-campaigns.controller";
import { EmailPreferencesController } from "./email-preferences.controller";
import { ResendWebhookController } from "./resend-webhook.controller";
import { EmailCampaignProcessor } from "./email-campaigns.processor";
import { EmailCampaignSweeper } from "./email-campaigns.sweeper";

@Module({
  imports: [NotificationsModule, BullModule.registerQueue({ name: EMAIL_CAMPAIGN_QUEUE })],
  controllers: [EmailCampaignsController, EmailPreferencesController, ResendWebhookController],
  providers: [CampaignAudienceService, EmailCampaignsService, EmailCampaignProcessor, EmailCampaignSweeper],
})
export class EmailCampaignsModule {}
