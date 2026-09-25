import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import type { Job, Queue } from "bullmq";
import { PrismaService } from "src/shared/service/prisma.service";
import { RedisService } from "src/shared/service/redis.service";
import { MAIL_QUEUE } from "src/shared/mail/mail.constants";
import { dailyMailKey } from "src/shared/mail/mail.processor";
import { EMAIL_CAMPAIGN_QUEUE } from "../email-campaigns/email-campaigns.constants";
import { ORDER_EXPIRY_QUEUE } from "../orders/order-expiry.constants";

export const QUEUE_LABELS: Record<string, string> = {
  [MAIL_QUEUE]: "Gửi email",
  [EMAIL_CAMPAIGN_QUEUE]: "Chiến dịch email (phân phối)",
  [ORDER_EXPIRY_QUEUE]: "Hết hạn thanh toán đơn hàng",
};

const STATES = ["waiting", "active", "delayed", "failed", "completed"] as const;
export type JobState = (typeof STATES)[number];

const mask = (e: unknown) => (typeof e === "string" ? e.replace(/^(.).*(@.*)$/, "$1***$2") : undefined);

@Injectable()
export class QueueMonitorService {
  private readonly queues: Record<string, Queue>;

  constructor(
    @InjectQueue(MAIL_QUEUE) mail: Queue,
    @InjectQueue(EMAIL_CAMPAIGN_QUEUE) campaign: Queue,
    @InjectQueue(ORDER_EXPIRY_QUEUE) orders: Queue,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    this.queues = { [MAIL_QUEUE]: mail, [EMAIL_CAMPAIGN_QUEUE]: campaign, [ORDER_EXPIRY_QUEUE]: orders };
  }

  private queue(name: string) {
    const q = this.queues[name];
    if (!q) throw new NotFoundException("Không có hàng đợi này");
    return q;
  }

  async overview() {
    return Promise.all(
      Object.entries(this.queues).map(async ([name, q]) => {
        const counts = await q.getJobCounts("waiting", "active", "delayed", "failed", "completed");
        return { name, label: QUEUE_LABELS[name] ?? name, counts };
      }),
    );
  }

  /** Chỉ trả thông tin đủ để chẩn đoán: KHÔNG trả nội dung thư (có thể chứa OTP) hay địa chỉ đầy đủ. */
  private summarize(job: Job) {
    const d = (job.data ?? {}) as Record<string, unknown>;
    return {
      id: job.id,
      name: job.name,
      attemptsMade: job.attemptsMade,
      maxAttempts: job.opts.attempts ?? 1,
      failedReason: job.failedReason ? String(job.failedReason).slice(0, 300) : null,
      timestamp: job.timestamp,
      processedOn: job.processedOn ?? null,
      finishedOn: job.finishedOn ?? null,
      delayUntil: job.opts.delay ? job.timestamp + job.opts.delay : null,
      info: {
        kind: d.kind,
        to: mask(d.to),
        subject: typeof d.subject === "string" ? d.subject.slice(0, 120) : undefined,
        campaignId: d.campaignId,
        orderId: d.orderId,
      },
    };
  }

  async jobs(name: string, state: JobState, limit: number) {
    if (!STATES.includes(state)) throw new BadRequestException("Trạng thái không hợp lệ");
    const jobs = await this.queue(name).getJobs([state], 0, Math.max(0, limit - 1), false);
    return jobs.filter(Boolean).map((j) => this.summarize(j));
  }

  async retry(name: string, id: string) {
    const job = await this.queue(name).getJob(id);
    if (!job) throw new NotFoundException("Không tìm thấy job");
    if ((await job.getState()) !== "failed") throw new BadRequestException("Chỉ thử lại được job đã thất bại");
    await job.retry("failed");
    return { success: true };
  }

  async remove(name: string, id: string) {
    const job = await this.queue(name).getJob(id);
    if (!job) throw new NotFoundException("Không tìm thấy job");
    if ((await job.getState()) === "active") throw new BadRequestException("Job đang chạy, chưa thể xoá");
    await job.remove();
    return { success: true };
  }

  async retryAllFailed(name: string, limit = 100) {
    const failed = await this.queue(name).getJobs(["failed"], 0, limit - 1, false);
    let retried = 0;
    for (const job of failed.filter(Boolean)) {
      try {
        await job.retry("failed");
        retried++;
      } catch {
        // job đã đổi trạng thái giữa chừng: bỏ qua
      }
    }
    return { retried };
  }

  /** Tình trạng hệ thống và hạn mức gửi mail trong ngày. */
  async system() {
    const t0 = Date.now();
    const [db, redisPing, sentToday, users] = await Promise.all([
      this.prisma.$queryRaw`SELECT 1`.then(() => ({ ok: true, ms: Date.now() - t0 })).catch(() => ({ ok: false, ms: null })),
      this.redis.getClient()?.ping().then(() => true).catch(() => false) ?? false,
      this.redis.get(dailyMailKey()).then((v) => Number(v ?? 0)).catch(() => 0),
      this.prisma.user.count({ where: { status: "ACTIVE", deletedAt: null } }).catch(() => null),
    ]);
    const cap = Number(process.env.MAIL_DAILY_CAP ?? 100);
    const reserve = Number(process.env.MAIL_TRANSACTIONAL_RESERVE ?? 40);
    const mem = process.memoryUsage();
    return {
      database: db,
      redis: redisPing,
      mail: {
        sentToday,
        dailyCap: cap,
        transactionalReserve: reserve,
        campaignBudgetLeft: Math.max(0, cap - reserve - sentToday),
        resendConfigured: !!process.env.RESEND_API_KEY && !!process.env.MAIL_FROM,
        webhookConfigured: !!process.env.RESEND_WEBHOOK_SECRET,
      },
      process: {
        uptimeSeconds: Math.round(process.uptime()),
        rssMb: Math.round(mem.rss / 1048576),
        heapUsedMb: Math.round(mem.heapUsed / 1048576),
        node: process.version,
      },
      activeUsers: users,
      serverTime: new Date().toISOString(),
    };
  }
}
