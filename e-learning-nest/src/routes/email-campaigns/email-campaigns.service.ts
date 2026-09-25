import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import type { Queue } from "bullmq";
import { CampaignStatus, Prisma } from "@prisma/client";
import { PrismaService } from "src/shared/service/prisma.service";
import { SendEmailService } from "src/shared/service/send-email.service";
import { NotificationsService } from "../notifications/notifications.service";
import { Actor, CampaignAudienceService } from "./campaign-audience.service";
import { DISPATCH_JOB, EMAIL_CAMPAIGN_QUEUE, dispatchJobId } from "./email-campaigns.constants";
import { CreateCampaignBody, ListCampaignsQuery, UpdateCampaignBody } from "./email-campaigns.model";
import { fillSubject, markdownToHtml, renderCampaignEmail } from "src/shared/mail/render.util";
import { signUnsubscribeToken } from "./unsubscribe-token.util";

const campaignSelect = {
  id: true,
  senderId: true,
  sender: { select: { id: true, name: true } },
  subject: true,
  body: true,
  audience: true,
  status: true,
  isApproved: true,
  isServiceNotice: true,
  approvedById: true,
  approvedAt: true,
  rejectedReason: true,
  scheduledAt: true,
  startedAt: true,
  finishedAt: true,
  totalRecipients: true,
  sentCount: true,
  failedCount: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EmailCampaignSelect;

/** Trạng thái cho phép sửa nội dung/đối tượng. Sửa sau khi duyệt sẽ mất duyệt. */
const EDITABLE: CampaignStatus[] = ["DRAFT", "REJECTED", "PENDING_APPROVAL", "APPROVED", "SCHEDULED"];
const CANCELLABLE: CampaignStatus[] = ["PENDING_APPROVAL", "APPROVED", "SCHEDULED", "SENDING"];
const DELETABLE: CampaignStatus[] = ["DRAFT", "REJECTED", "CANCELLED"];

const envInt = (name: string, fallback: number) => {
  const n = Number(process.env[name]);
  return process.env[name] !== undefined && process.env[name] !== "" && Number.isFinite(n) && n >= 0 ? n : fallback;
};

const publicUrl = () => (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

@Injectable()
export class EmailCampaignsService {
  private readonly logger = new Logger(EmailCampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audience: CampaignAudienceService,
    private readonly sendEmail: SendEmailService,
    private readonly notifications: NotificationsService,
    @InjectQueue(EMAIL_CAMPAIGN_QUEUE) private readonly queue: Queue,
  ) {}

  // ------------------------------------------------------------------ quyền
  private assertCanUse(actor: Actor) {
    if (actor.roleName !== "ADMIN" && actor.roleName !== "INSTRUCTOR") {
      throw new ForbiddenException("Chỉ admin và giảng viên được dùng kênh email");
    }
  }
  private isAdmin(actor: Actor) {
    return actor.roleName === "ADMIN";
  }

  /** Lấy chiến dịch và bảo đảm người gọi có quyền xem (chủ sở hữu hoặc admin). */
  private async load(id: string, actor: Actor, opts: { ownerOnly?: boolean } = {}) {
    this.assertCanUse(actor);
    const c = await this.prisma.emailCampaign.findUnique({ where: { id }, select: campaignSelect });
    if (!c) throw new NotFoundException("Không tìm thấy chiến dịch");
    const owner = c.senderId === actor.userId;
    if (!owner && (opts.ownerOnly || !this.isAdmin(actor))) throw new ForbiddenException("Bạn không có quyền với chiến dịch này");
    return c;
  }

  // ------------------------------------------------------------------- CRUD
  async create(actor: Actor, body: CreateCampaignBody) {
    this.assertCanUse(actor);
    await this.audience.assertAllowed(body.audience, actor, body.isServiceNotice);
    return this.prisma.emailCampaign.create({
      data: {
        senderId: actor.userId,
        subject: body.subject,
        body: body.body,
        audience: body.audience as unknown as Prisma.InputJsonValue,
        isServiceNotice: body.isServiceNotice,
      },
      select: campaignSelect,
    });
  }

  async list(actor: Actor, q: ListCampaignsQuery) {
    this.assertCanUse(actor);
    const onlyMine = !this.isAdmin(actor) || q.mine === "true";
    const where: Prisma.EmailCampaignWhereInput = {
      ...(onlyMine ? { senderId: actor.userId } : {}),
      ...(q.status ? { status: q.status } : {}),
    };
    const [total, data] = await Promise.all([
      this.prisma.emailCampaign.count({ where }),
      this.prisma.emailCampaign.findMany({
        where,
        select: { ...campaignSelect, body: false },
        orderBy: { createdAt: "desc" },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
    ]);
    return { data, total, page: q.page, limit: q.limit, totalPages: Math.max(1, Math.ceil(total / q.limit)) };
  }

  get(actor: Actor, id: string) {
    return this.load(id, actor);
  }

  /** Sửa nội dung/đối tượng. Nếu đã được duyệt hoặc đã lên lịch thì MẤT DUYỆT và về nháp, để không ai duyệt bản này rồi đổi thành bản khác. */
  async update(actor: Actor, id: string, body: UpdateCampaignBody) {
    const c = await this.load(id, actor, { ownerOnly: true });
    if (!EDITABLE.includes(c.status)) throw new BadRequestException("Chiến dịch đang hoặc đã gửi, không thể sửa");

    const audience = body.audience ?? (c.audience as any);
    const isServiceNotice = body.isServiceNotice ?? c.isServiceNotice;
    await this.audience.assertAllowed(audience, actor, isServiceNotice);

    if (["APPROVED", "SCHEDULED", "PENDING_APPROVAL"].includes(c.status)) await this.removeDispatchJob(id);

    return this.prisma.emailCampaign.update({
      where: { id },
      data: {
        ...(body.subject !== undefined ? { subject: body.subject } : {}),
        ...(body.body !== undefined ? { body: body.body } : {}),
        ...(body.audience ? { audience: body.audience as unknown as Prisma.InputJsonValue } : {}),
        ...(body.isServiceNotice !== undefined ? { isServiceNotice: body.isServiceNotice } : {}),
        status: "DRAFT",
        isApproved: false,
        approvedById: null,
        approvedAt: null,
        rejectedReason: null,
        scheduledAt: null,
      },
      select: campaignSelect,
    });
  }

  async remove(actor: Actor, id: string) {
    const c = await this.load(id, actor);
    if (!DELETABLE.includes(c.status)) throw new BadRequestException("Chỉ xoá được chiến dịch nháp, bị từ chối hoặc đã huỷ");
    await this.prisma.emailCampaign.delete({ where: { id } });
    return { success: true };
  }

  // ------------------------------------------------------------ xem trước, gửi thử
  async previewAudience(actor: Actor, id: string) {
    const c = await this.load(id, actor);
    const recipients = await this.audience.resolve(c.audience as any, { isServiceNotice: c.isServiceNotice, senderId: c.senderId });
    const mask = (e: string) => e.replace(/^(.).*(@.*)$/, "$1***$2");
    return { count: recipients.length, sample: recipients.slice(0, 5).map((r) => mask(r.email)) };
  }

  async testSend(actor: Actor, id: string) {
    const c = await this.load(id, actor, { ownerOnly: true });
    const me = await this.prisma.user.findUnique({ where: { id: actor.userId }, select: { id: true, email: true, name: true } });
    if (!me) throw new NotFoundException("Không tìm thấy tài khoản");
    const html = this.renderFor(c, { id: me.id, name: me.name }, await this.senderLabelFor(c));
    await this.sendEmail.enqueueTestMail({ to: me.email, subject: `[Gửi thử] ${fillSubject(c.subject, { name: me.name })}`, html });
    return { sentTo: me.email.replace(/^(.).*(@.*)$/, "$1***$2") };
  }

  // -------------------------------------------------- nộp, duyệt, từ chối
  async submit(actor: Actor, id: string) {
    const c = await this.load(id, actor, { ownerOnly: true });
    if (c.status !== "DRAFT" && c.status !== "REJECTED") throw new BadRequestException("Chỉ nộp được chiến dịch đang ở trạng thái nháp hoặc bị từ chối");
    await this.audience.assertAllowed(c.audience as any, actor, c.isServiceNotice);

    const recipients = await this.audience.resolve(c.audience as any, { isServiceNotice: c.isServiceNotice, senderId: c.senderId });
    if (recipients.length === 0) throw new BadRequestException("Đối tượng đã chọn hiện không có người nhận nào");

    if (!this.isAdmin(actor)) {
      const weekly = envInt("INSTRUCTOR_CAMPAIGNS_PER_WEEK", 3);
      const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
      const used = await this.prisma.emailCampaign.count({
        where: { senderId: actor.userId, id: { not: id }, createdAt: { gte: since }, status: { in: ["PENDING_APPROVAL", "APPROVED", "SCHEDULED", "SENDING", "SENT"] } },
      });
      if (used >= weekly) throw new BadRequestException(`Bạn đã dùng hết ${weekly} chiến dịch trong 7 ngày gần đây`);
    }

    if (this.isAdmin(actor)) {
      // Admin tự duyệt khi bấm gửi duyệt
      return this.prisma.emailCampaign.update({
        where: { id },
        data: { status: "APPROVED", isApproved: true, approvedById: actor.userId, approvedAt: new Date(), rejectedReason: null },
        select: campaignSelect,
      });
    }

    const updated = await this.prisma.emailCampaign.update({
      where: { id },
      data: { status: "PENDING_APPROVAL", isApproved: false, rejectedReason: null },
      select: campaignSelect,
    });
    await this.notifyAdminsPending(updated.id, updated.sender.name, updated.subject);
    return updated;
  }

  async approve(actor: Actor, id: string) {
    if (!this.isAdmin(actor)) throw new ForbiddenException("Chỉ admin được duyệt");
    const c = await this.load(id, actor);
    if (c.status !== "PENDING_APPROVAL") throw new BadRequestException("Chiến dịch không ở trạng thái chờ duyệt");
    const updated = await this.prisma.emailCampaign.update({
      where: { id },
      data: { status: "APPROVED", isApproved: true, approvedById: actor.userId, approvedAt: new Date(), rejectedReason: null },
      select: campaignSelect,
    });
    await this.notifySender(updated.senderId, "Email của bạn đã được duyệt", `Chiến dịch "${updated.subject}" đã được duyệt. Bạn có thể gửi ngay hoặc hẹn giờ.`, updated.id);
    return updated;
  }

  async reject(actor: Actor, id: string, reason: string) {
    if (!this.isAdmin(actor)) throw new ForbiddenException("Chỉ admin được từ chối");
    const c = await this.load(id, actor);
    if (c.status !== "PENDING_APPROVAL") throw new BadRequestException("Chiến dịch không ở trạng thái chờ duyệt");
    const updated = await this.prisma.emailCampaign.update({
      where: { id },
      data: { status: "REJECTED", isApproved: false, rejectedReason: reason },
      select: campaignSelect,
    });
    await this.notifySender(updated.senderId, "Email của bạn bị từ chối", `Chiến dịch "${updated.subject}" chưa được duyệt: ${reason}`, updated.id);
    return updated;
  }

  // ---------------------------------------------------------- gửi, huỷ
  /** Gửi ngay hoặc hẹn giờ. Chỉ chiến dịch ĐÃ DUYỆT (isApproved) mới gửi được. */
  async send(actor: Actor, id: string, scheduledAt?: Date) {
    const c = await this.load(id, actor, { ownerOnly: true });
    if (c.status !== "APPROVED" || !c.isApproved) throw new BadRequestException("Chiến dịch chưa được duyệt nên chưa thể gửi");

    const when = scheduledAt && scheduledAt.getTime() > Date.now() + 60_000 ? scheduledAt : new Date();
    const updated = await this.prisma.emailCampaign.update({
      where: { id },
      data: { status: "SCHEDULED", scheduledAt: when },
      select: campaignSelect,
    });
    await this.removeDispatchJob(id);
    await this.queue.add(
      DISPATCH_JOB,
      { campaignId: id },
      {
        jobId: dispatchJobId(id),
        delay: Math.max(0, when.getTime() - Date.now()),
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
        removeOnFail: { age: 3600, count: 100 },
      },
    );
    return updated;
  }

  async cancel(actor: Actor, id: string) {
    const c = await this.load(id, actor);
    if (!CANCELLABLE.includes(c.status)) throw new BadRequestException("Không thể huỷ chiến dịch ở trạng thái này");
    await this.removeDispatchJob(id);
    // Mail đã vào hàng đợi sẽ bị worker bỏ qua vì worker kiểm tra lại trạng thái trước khi gửi
    return this.prisma.emailCampaign.update({
      where: { id },
      data: { status: "CANCELLED", isApproved: false, finishedAt: new Date() },
      select: campaignSelect,
    });
  }

  // -------------------------------------------------------- worker: dispatch
  /** Quét các chiến dịch đã đến giờ (lưới an toàn khi job hẹn giờ trong Redis bị mất). */
  async dispatchDue(): Promise<number> {
    const due = await this.prisma.emailCampaign.findMany({
      where: { status: "SCHEDULED", isApproved: true, scheduledAt: { lte: new Date() } },
      select: { id: true },
      take: 20,
    });
    for (const c of due) await this.dispatch(c.id, false);
    return due.length;
  }

  /**
   * Chuyển SCHEDULED → SENDING (nguyên tử, chỉ khi còn isApproved), phân giải người nhận rồi đưa từng mail vào hàng đợi `mail`.
   * `isRetry`: job bị chạy lại sau khi đã chuyển SENDING mà chưa kịp đưa hết mail vào hàng đợi: tiếp tục đưa nốt
   * (jobId và Idempotency-Key theo từng người nên không gửi trùng).
   */
  async dispatch(campaignId: string, isRetry: boolean): Promise<"sent" | "skipped"> {
    const claimed = await this.prisma.emailCampaign.updateMany({
      where: { id: campaignId, status: "SCHEDULED", isApproved: true },
      data: { status: "SENDING", startedAt: new Date() },
    });
    if (claimed.count !== 1) {
      if (!isRetry) return "skipped";
      const again = await this.prisma.emailCampaign.findFirst({ where: { id: campaignId, status: "SENDING", isApproved: true }, select: { id: true } });
      if (!again) return "skipped";
    }

    const c = await this.prisma.emailCampaign.findUniqueOrThrow({ where: { id: campaignId }, select: campaignSelect });
    const recipients = await this.audience.resolve(c.audience as any, { isServiceNotice: c.isServiceNotice, senderId: c.senderId });

    await this.prisma.emailCampaign.update({ where: { id: campaignId }, data: { totalRecipients: recipients.length } });
    if (recipients.length === 0) {
      await this.prisma.emailCampaign.update({ where: { id: campaignId }, data: { status: "SENT", finishedAt: new Date() } });
      return "sent";
    }

    const senderLabel = await this.senderLabelFor(c);
    for (const r of recipients) {
      const token = signUnsubscribeToken(r.id);
      const unsubscribeUrl = `${publicUrl()}/unsubscribe?token=${token}`;
      const courseTitle = await this.courseTitleFor(c.audience as any);
      await this.sendEmail.enqueueCampaignMail({
        campaignId,
        userId: r.id,
        to: r.email,
        subject: fillSubject(c.subject, { name: r.name, courseTitle }),
        html: this.renderFor(c, r, senderLabel, courseTitle),
        ...(c.isServiceNotice
          ? {}
          : {
              headers: {
                // RFC 8058: nút "Hủy đăng ký" một chạm trong Gmail/Apple Mail (gửi POST tới đúng URL này)
                "List-Unsubscribe": `<${publicUrl()}/api/email/unsubscribe?token=${token}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
            }),
        replyTo: process.env.MAIL_REPLY_TO || undefined,
      });
    }
    return "sent";
  }

  // --------------------------------------------------------------- nội bộ
  private courseTitleCache = new Map<string, string>();
  private async courseTitleFor(audience: { type: string; courseId?: string }): Promise<string | undefined> {
    if (audience.type !== "COURSE_ENROLLEES" || !audience.courseId) return undefined;
    const hit = this.courseTitleCache.get(audience.courseId);
    if (hit) return hit;
    const course = await this.prisma.course.findUnique({ where: { id: audience.courseId }, select: { title: true } });
    if (course) this.courseTitleCache.set(audience.courseId, course.title);
    return course?.title;
  }

  /** Admin ký tên "Ban quản trị", giảng viên ký tên riêng để người nhận biết thư đến từ ai. */
  private async senderLabelFor(c: { sender: { name: string }; senderId: string }) {
    const admin = await this.prisma.userRole.findFirst({ where: { userId: c.senderId, role: { name: "ADMIN" } }, select: { userId: true } });
    return admin ? "Ban quản trị U Đê Mê" : `${c.sender.name} (giảng viên) qua U Đê Mê`;
  }

  private renderFor(
    c: { subject: string; body: string; isServiceNotice: boolean; sender: { name: string } },
    r: { id: string; name: string },
    senderLabel: string,
    courseTitle?: string,
  ) {
    return renderCampaignEmail({
      bodyHtml: markdownToHtml(c.body),
      vars: { name: r.name, courseTitle },
      senderLabel,
      isServiceNotice: c.isServiceNotice,
      unsubscribeUrl: c.isServiceNotice ? undefined : `${publicUrl()}/unsubscribe?token=${signUnsubscribeToken(r.id)}`,
      companyAddress: process.env.MAIL_COMPANY_ADDRESS || undefined,
    });
  }

  private async removeDispatchJob(campaignId: string) {
    try {
      const job = await this.queue.getJob(dispatchJobId(campaignId));
      if (job) await job.remove();
    } catch (error) {
      this.logger.warn(`Không gỡ được job gửi của chiến dịch ${campaignId}: ${error}`);
    }
  }

  private async notifyAdminsPending(campaignId: string, senderName: string, subject: string) {
    try {
      const admins = await this.prisma.user.findMany({
        where: { status: "ACTIVE", deletedAt: null, userRoles: { some: { role: { name: "ADMIN" } } } },
        select: { id: true },
      });
      await Promise.all(
        admins.map((a) =>
          this.notifications.create({
            userId: a.id,
            type: "SYSTEM",
            title: "Email chờ duyệt",
            message: `${senderName} vừa nộp chiến dịch "${subject}" chờ duyệt.`,
            data: { kind: "email-campaign", campaignId },
          }),
        ),
      );
    } catch (error) {
      this.logger.warn(`Không gửi được thông báo chờ duyệt: ${error}`);
    }
  }

  private async notifySender(userId: string, title: string, message: string, campaignId: string) {
    try {
      await this.notifications.create({ userId, type: "SYSTEM", title, message, data: { kind: "email-campaign", campaignId } });
    } catch (error) {
      this.logger.warn(`Không gửi được thông báo kết quả duyệt: ${error}`);
    }
  }
}
