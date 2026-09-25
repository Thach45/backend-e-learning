import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { DelayedError, UnrecoverableError } from 'bullmq';
import type { Job } from 'bullmq';
import { PrismaService } from '../service/prisma.service';
import { RedisService } from '../service/redis.service';
import { MAIL_QUEUE, MailJobData } from './mail.constants';

/** Chiến dịch đã bị huỷ hoặc chưa được duyệt: bỏ mail này và KHÔNG tính là lỗi gửi. */
export class CampaignSkippedError extends UnrecoverableError {
  constructor(message: string) {
    super(message);
    this.name = 'CampaignSkippedError';
  }
}

const envInt = (name: string, fallback: number) => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n >= 0 && process.env[name] !== '' && process.env[name] !== undefined ? n : fallback;
};

/** Khoá đếm số mail đã gửi trong ngày (UTC). Tính cả mail giao dịch để hạn mức phản ánh đúng thực tế. */
export const dailyMailKey = (now = new Date()) => `mail:sent:${now.toISOString().slice(0, 10)}`;
const nextUtcMidnightPlus = (now = new Date()) =>
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 1, 0);

/**
 * Worker gửi mail qua Resend. Lỗi tạm thời (mạng, 429, 5xx) thì ném lỗi thường để BullMQ retry theo backoff;
 * lỗi vĩnh viễn (địa chỉ sai, domain chưa verify, thiếu cấu hình) thì UnrecoverableError để không retry vô ích.
 * limiter: Resend mặc định cho 2 request/giây mỗi tài khoản.
 *
 * Mail của chiến dịch còn phải qua hai lớp an toàn: (1) kiểm tra lại isApproved và trạng thái ngay trước khi gửi,
 * (2) hạn mức ngày: chỉ được dùng (MAIL_DAILY_CAP − MAIL_TRANSACTIONAL_RESERVE), phần còn lại dành cho OTP/đơn hàng;
 * hết hạn mức thì hoãn sang ngày sau.
 */
@Processor(MAIL_QUEUE, { concurrency: 2, limiter: { max: 2, duration: 1000 } })
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    super();
  }

  async process(job: Job<MailJobData>, token?: string): Promise<{ id?: string }> {
    const { to, subject, html, idempotencyKey, expiresAt, campaignId, headers, replyTo } = job.data;

    if (expiresAt && Date.now() > expiresAt) {
      throw new UnrecoverableError('Mail đã quá hạn hiệu lực (ví dụ OTP hết hạn), bỏ qua');
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM;
    if (!apiKey || !from) {
      throw new UnrecoverableError('Thiếu cấu hình gửi mail: cần RESEND_API_KEY và MAIL_FROM');
    }

    if (campaignId) {
      const campaign = await this.prisma.emailCampaign.findUnique({
        where: { id: campaignId },
        select: { status: true, isApproved: true },
      });
      if (!campaign || campaign.status === 'CANCELLED') throw new CampaignSkippedError('Chiến dịch đã bị huỷ hoặc không tồn tại');
      if (!campaign.isApproved || campaign.status !== 'SENDING') throw new CampaignSkippedError('Chiến dịch chưa được duyệt');

      const limit = envInt('MAIL_DAILY_CAP', 100) - envInt('MAIL_TRANSACTIONAL_RESERVE', 40);
      const used = Number((await this.redis.get(dailyMailKey())) ?? 0);
      if (used >= limit) {
        // Hết phần hạn mức dành cho chiến dịch hôm nay: hoãn sang đầu ngày (UTC) kế tiếp, không tính là một lần thử
        await job.moveToDelayed(nextUtcMidnightPlus(), token);
        throw new DelayedError();
      }
    }

    let response: Response;
    try {
      response = await fetch(`${process.env.RESEND_API_URL ?? 'https://api.resend.com'}/emails`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
          ...(replyTo ? { reply_to: replyTo } : {}),
          ...(headers && Object.keys(headers).length ? { headers } : {}),
        }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      // Lỗi mạng hoặc timeout: chưa biết Resend đã nhận chưa, retry an toàn nhờ Idempotency-Key
      throw new Error(`Không gọi được Resend: ${(error as Error).message}`);
    }

    const data: any = await response.json().catch(() => ({}));
    if (response.ok) {
      await this.countSent();
      return { id: data?.id };
    }

    // Không đưa nội dung mail (có OTP) hay khóa API vào thông báo lỗi
    const reason = `Resend trả ${response.status}: ${data?.message ?? data?.name ?? 'unknown'}`;
    if (response.status === 429 || response.status >= 500) throw new Error(reason);
    // 409 (đang xử lý cùng Idempotency-Key) cũng nên thử lại sau
    if (response.status === 409) throw new Error(reason);
    throw new UnrecoverableError(reason);
  }

  private async countSent() {
    const client = this.redis.getClient();
    if (!client) return;
    const key = dailyMailKey();
    const n = await client.incr(key).catch(() => 0);
    if (n === 1) await client.expire(key, 3 * 24 * 3600).catch(() => undefined);
  }

  /** Cập nhật bộ đếm của chiến dịch và đóng chiến dịch khi đã gửi xong hết. */
  private async recordCampaignResult(campaignId: string, ok: boolean) {
    try {
      const c = await this.prisma.emailCampaign.update({
        where: { id: campaignId },
        data: ok ? { sentCount: { increment: 1 } } : { failedCount: { increment: 1 } },
        select: { status: true, sentCount: true, failedCount: true, totalRecipients: true },
      });
      if (c.status === 'SENDING' && c.sentCount + c.failedCount >= c.totalRecipients) {
        await this.prisma.emailCampaign.updateMany({
          where: { id: campaignId, status: 'SENDING' },
          data: { status: 'SENT', finishedAt: new Date() },
        });
      }
    } catch (error) {
      this.logger.warn(`Không cập nhật được bộ đếm chiến dịch ${campaignId}: ${error}`);
    }
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<MailJobData>, result: { id?: string }) {
    this.logger.log(`Đã gửi mail [${job.data.kind}] job=${job.id} resendId=${result?.id ?? '-'}`);
    if (job.data.campaignId) await this.recordCampaignResult(job.data.campaignId, true);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<MailJobData> | undefined, error: Error) {
    if (!job) return;
    const attempts = job.opts.attempts ?? 1;
    const finalFail = job.attemptsMade >= attempts || error.name === 'UnrecoverableError' || error.name === 'CampaignSkippedError';
    const line = `Gửi mail [${job.data.kind}] job=${job.id} lần ${job.attemptsMade}/${attempts}: ${error.message}`;
    if (finalFail) this.logger.error(`THẤT BẠI HẲN. ${line}`);
    else this.logger.warn(`${line} (sẽ thử lại)`);

    if (finalFail && job.data.campaignId && error.name !== 'CampaignSkippedError') {
      await this.recordCampaignResult(job.data.campaignId, false);
    }
  }
}
