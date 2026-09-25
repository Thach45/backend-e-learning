import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { MAIL_QUEUE } from "src/shared/mail/mail.constants";
import { EMAIL_CAMPAIGN_QUEUE } from "../email-campaigns/email-campaigns.constants";
import { ORDER_EXPIRY_QUEUE } from "../orders/order-expiry.constants";
import { QueueMonitorController } from "./queue-monitor.controller";
import { QueueMonitorService } from "./queue-monitor.service";

@Module({
  imports: [BullModule.registerQueue({ name: MAIL_QUEUE }, { name: EMAIL_CAMPAIGN_QUEUE }, { name: ORDER_EXPIRY_QUEUE })],
  controllers: [QueueMonitorController],
  providers: [QueueMonitorService],
})
export class QueueMonitorModule {}
