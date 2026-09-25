import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { UnrecoverableError } from 'bullmq';
import type { Job } from 'bullmq';
import { MAIL_QUEUE, MailJobData } from './mail.constants';

/**
 * Worker gửi mail qua Resend. Lỗi tạm thời (mạng, 429, 5xx) thì ném lỗi thường để BullMQ retry theo backoff;
 * lỗi vĩnh viễn (địa chỉ sai, domain chưa verify, thiếu cấu hình) thì UnrecoverableError để không retry vô ích.
 * limiter: Resend mặc định cho 2 request/giây mỗi tài khoản.
 */
@Processor(MAIL_QUEUE, { concurrency: 2, limiter: { max: 2, duration: 1000 } })
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  async process(job: Job<MailJobData>): Promise<{ id?: string }> {
    const { to, subject, html, idempotencyKey, expiresAt } = job.data;

    if (expiresAt && Date.now() > expiresAt) {
      throw new UnrecoverableError('Mail đã quá hạn hiệu lực (ví dụ OTP hết hạn), bỏ qua');
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM;
    if (!apiKey || !from) {
      throw new UnrecoverableError('Thiếu cấu hình gửi mail: cần RESEND_API_KEY và MAIL_FROM');
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
        body: JSON.stringify({ from, to: [to], subject, html }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      // Lỗi mạng hoặc timeout: chưa biết Resend đã nhận chưa, retry an toàn nhờ Idempotency-Key
      throw new Error(`Không gọi được Resend: ${(error as Error).message}`);
    }

    const data: any = await response.json().catch(() => ({}));
    if (response.ok) return { id: data?.id };

    // Không đưa nội dung mail (có OTP) hay khóa API vào thông báo lỗi
    const reason = `Resend trả ${response.status}: ${data?.message ?? data?.name ?? 'unknown'}`;
    if (response.status === 429 || response.status >= 500) throw new Error(reason);
    // 409 (đang xử lý cùng Idempotency-Key) cũng nên thử lại sau
    if (response.status === 409) throw new Error(reason);
    throw new UnrecoverableError(reason);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<MailJobData>, result: { id?: string }) {
    this.logger.log(`Đã gửi mail [${job.data.kind}] job=${job.id} resendId=${result?.id ?? '-'}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<MailJobData> | undefined, error: Error) {
    if (!job) return;
    const attempts = job.opts.attempts ?? 1;
    const finalFail = job.attemptsMade >= attempts || error.name === 'UnrecoverableError';
    const line = `Gửi mail [${job.data.kind}] job=${job.id} lần ${job.attemptsMade}/${attempts}: ${error.message}`;
    if (finalFail) this.logger.error(`THẤT BẠI HẲN. ${line}`);
    else this.logger.warn(`${line} (sẽ thử lại)`);
  }
}
