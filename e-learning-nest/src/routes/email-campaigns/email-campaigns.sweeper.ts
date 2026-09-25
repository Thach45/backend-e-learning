import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import type { Queue } from "bullmq";
import { EMAIL_CAMPAIGN_QUEUE, SWEEP_EVERY_MS, SWEEP_JOB } from "./email-campaigns.constants";

@Injectable()
export class EmailCampaignSweeper implements OnModuleInit {
  private readonly logger = new Logger(EmailCampaignSweeper.name);

  constructor(@InjectQueue(EMAIL_CAMPAIGN_QUEUE) private readonly queue: Queue) {}

  async onModuleInit() {
    try {
      await this.queue.upsertJobScheduler("email-campaign-sweep", { every: SWEEP_EVERY_MS }, { name: SWEEP_JOB, opts: { removeOnComplete: true, removeOnFail: 20 } });
    } catch (error) {
      this.logger.error(`Không đăng ký được job quét chiến dịch: ${error}`);
    }
  }
}
