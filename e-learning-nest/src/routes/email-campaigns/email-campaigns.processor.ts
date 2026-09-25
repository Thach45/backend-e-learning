import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { EmailCampaignsService } from "./email-campaigns.service";
import { DISPATCH_JOB, EMAIL_CAMPAIGN_QUEUE, SWEEP_JOB } from "./email-campaigns.constants";

@Processor(EMAIL_CAMPAIGN_QUEUE)
export class EmailCampaignProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailCampaignProcessor.name);

  constructor(private readonly service: EmailCampaignsService) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case DISPATCH_JOB: {
        const result = await this.service.dispatch(job.data.campaignId, job.attemptsMade > 0);
        this.logger.log(`Chiến dịch ${job.data.campaignId}: ${result}`);
        return result;
      }
      case SWEEP_JOB: {
        const n = await this.service.dispatchDue();
        if (n > 0) this.logger.log(`Quét: đã gửi ${n} chiến dịch đến giờ`);
        return n;
      }
      default:
        this.logger.warn(`Job không xác định: ${job.name}`);
        return null;
    }
  }
}
