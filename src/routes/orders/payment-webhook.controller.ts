import { Body, Controller, Headers, HttpCode, Logger, Post, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { createHash, timingSafeEqual } from 'crypto';
import { Public } from 'src/shared/decorator/auth.decorator';
import { PaymentWebhookService } from './payment-webhook.service';
import { SepayWebhookPayloadSchema } from './payment-webhook.model';

/** So sánh chuỗi bí mật với thời gian không phụ thuộc nội dung (chống dò khóa qua độ trễ). */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

@Controller('api/webhooks')
export class PaymentWebhookController {
  private readonly logger = new Logger(PaymentWebhookController.name);

  constructor(private readonly service: PaymentWebhookService) {}

  /**
   * Webhook SePay. Bỏ qua JWT (@Public) vì SePay không có token người dùng; thay vào đó xác thực bằng
   * header `Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>`. Không giới hạn tần suất vì SePay có thể gửi dồn.
   *
   * SePay yêu cầu HTTP 200/201 và body đúng `{"success": true}`, nếu không sẽ gửi lại tối đa 7 lần.
   * Dùng @Res() để không bị TransformInterceptor bọc lại thành {statusCode, message, data}.
   */
  @Public()
  @SkipThrottle()
  @HttpCode(200)
  @Post('sepay')
  async sepay(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: unknown,
    @Res() res: Response,
  ) {
    const expectedKey = process.env.SEPAY_WEBHOOK_API_KEY;
    if (!expectedKey) {
      // Fail closed: chưa cấu hình khóa thì từ chối mọi request
      this.logger.error('SEPAY_WEBHOOK_API_KEY chưa được cấu hình, từ chối webhook');
      return res.status(401).json({ success: false, message: 'Webhook is not configured' });
    }

    const match = authorization?.match(/^Apikey\s+(.+)$/i);
    if (!match || !safeEqual(match[1].trim(), expectedKey)) {
      return res.status(401).json({ success: false, message: 'Invalid API key' });
    }

    const parsed = SepayWebhookPayloadSchema.safeParse(body);
    if (!parsed.success) {
      // Payload sai định dạng thì gửi lại cũng vô ích
      this.logger.warn(`Payload SePay không hợp lệ: ${JSON.stringify(parsed.error.issues).slice(0, 300)}`);
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    // Lỗi tạm thời (DB...) cứ để ném ra: trả 5xx để SePay gửi lại
    await this.service.handleSepay(parsed.data);
    return res.status(200).json({ success: true });
  }
}
