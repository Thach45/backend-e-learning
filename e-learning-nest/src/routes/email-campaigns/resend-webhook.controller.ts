import { Controller, Headers, HttpCode, Logger, Post, Req, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { SkipThrottle } from "@nestjs/throttler";
import { Public } from "src/shared/decorator/auth.decorator";
import { PrismaService } from "src/shared/service/prisma.service";
import { verifyResendWebhook } from "./resend-webhook.util";

/**
 * Webhook Resend (chữ ký Svix). Địa chỉ bị bounce vĩnh viễn hoặc báo spam được đưa vào EmailSuppression
 * để không bao giờ gửi chiến dịch tới nữa, bảo vệ uy tín domain (đang dùng chung với dự án khác).
 */
@Controller("api")
export class ResendWebhookController {
  private readonly logger = new Logger(ResendWebhookController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @SkipThrottle()
  @Post("webhooks/resend")
  @HttpCode(200)
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers("svix-id") id?: string,
    @Headers("svix-timestamp") timestamp?: string,
    @Headers("svix-signature") signature?: string,
  ) {
    const secret = process.env.RESEND_WEBHOOK_SECRET;
    if (!secret) throw new ServiceUnavailableException("Webhook is not configured");

    const rawBody = req.rawBody?.toString("utf8") ?? "";
    if (!verifyResendWebhook({ secret, id, timestamp, signature, rawBody })) {
      throw new UnauthorizedException("Invalid signature");
    }

    const event = JSON.parse(rawBody) as { type?: string; data?: { to?: string[]; bounce?: { type?: string } } };
    const to = (event.data?.to ?? []).map((e) => String(e).toLowerCase());

    let reason: "BOUNCE" | "COMPLAINT" | null = null;
    if (event.type === "email.complained") reason = "COMPLAINT";
    else if (event.type === "email.bounced" && event.data?.bounce?.type === "Permanent") reason = "BOUNCE";

    if (reason && to.length) {
      for (const email of to) {
        await this.prisma.emailSuppression.upsert({ where: { email }, update: {}, create: { email, reason } });
      }
      this.logger.warn(`Đã chặn ${to.length} địa chỉ (${reason}) theo webhook Resend`);
    }
    return { received: true };
  }
}
