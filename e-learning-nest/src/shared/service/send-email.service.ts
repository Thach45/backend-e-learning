import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { randomUUID } from 'crypto';
import ms from 'ms';
import type { JobsOptions, Queue } from 'bullmq';
import { generateTemplate } from '../helper/generate-template';
import { generateSuccessfulOrderTemplate, InvoiceCourseItem } from '../helper/generate-successful-order-template';
import { generateOrderCreatedTemplate, OrderCourseItem } from '../helper/generate-order-created-template';
import { generateNewLoginTemplate } from '../helper/generate-new-login-template';
import { MAIL_QUEUE, MailJobData, SEND_MAIL_JOB } from '../mail/mail.constants';

/**
 * Producer: render mail rồi thêm vào hàng đợi `mail` và trả về ngay (không chờ Resend).
 * Việc gửi thật, retry và giới hạn tốc độ do MailProcessor lo. Nếu Redis lỗi thì `add` ném lỗi:
 * OTP báo lỗi cho người dùng, còn mail đơn hàng/cảnh báo đăng nhập đã được nơi gọi bọc try/catch.
 */
@Injectable()
export class SendEmailService {
  constructor(@InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue<MailJobData>) {}

  private enqueue(
    data: Omit<MailJobData, 'idempotencyKey'> & { idempotencyKey?: string },
    opts: { jobId?: string; attempts: number; priority?: number },
  ) {
    const { jobId, attempts, priority } = opts;
    const options: JobsOptions = {
      jobId,
      priority,
      attempts,
      // 3s, 6s, 12s, 24s... (gấp đôi mỗi lần)
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: true,
      // Giữ job lỗi 1 giờ (tối đa 500) để điều tra hoặc thử lại tay; job chứa nội dung mail nên không giữ lâu
      removeOnFail: { age: 3600, count: 500 },
    };
    return this.mailQueue.add(
      SEND_MAIL_JOB,
      { ...data, idempotencyKey: data.idempotencyKey ?? randomUUID() },
      options,
    );
  }

  async sendOtpEmail({
    recipientEmail,
    otp
  }: {
    recipientEmail: string,
    otp : string,
  }) {
    const content = generateTemplate(otp, "U Đê Mê", "123 Nguyen Van Linh, Q9, TP.HCM");
    const validForMs = Number(ms((process.env.EXPIRE_OTP ?? '5m') as ms.StringValue)) || 5 * 60_000;
    return this.enqueue(
      {
        kind: 'otp',
        to: recipientEmail,
        subject: 'Mã xác thực của bạn',
        html: content,
        // OTP hết hạn thì gửi cũng vô ích
        expiresAt: Date.now() + validForMs,
      },
      // Ưu tiên cao nhất và ít lần thử hơn (tổng chờ khoảng 20 giây), vì người dùng đang đợi mã
      { attempts: 4, priority: 1 },
    );
  }


  async sendSuccessfulOrder({
    recipientEmail,
    customerName,
    orderId,
    orderDate,
    courses,
    totalAmount,
    myCoursesUrl,
  }: {
    recipientEmail: string;
    customerName: string;
    orderId: string;
    orderDate: string;
    courses: OrderCourseItem[];
    totalAmount: number;
    myCoursesUrl: string;
  }) {
    const content = generateOrderCreatedTemplate(
      customerName,
      orderId,
      orderDate,
      courses,
      totalAmount,
      myCoursesUrl,
      "U Đê Mê",
      "123 Nguyen Van Linh, Q9, TP.HCM"
    );
    // jobId và idempotencyKey theo đơn: gọi trùng thì không gửi mail thứ hai
    return this.enqueue(
      { kind: 'order-created', to: recipientEmail, subject: 'Đơn hàng đã được khởi tạo - Chờ thanh toán', html: content, idempotencyKey: `order-created-${orderId}` },
      { jobId: `order-created-${orderId}`, attempts: 8 },
    );
  }

  async sendSuccessfulPayment({
    recipientEmail,
    customerName,
    orderId,
    orderDate,
    paymentMethod,
    courses,
    totalAmount,
    myCoursesUrl,
  }: {
    recipientEmail: string;
    customerName: string;
    orderId: string;
    orderDate: string;
    paymentMethod: string;
    courses: InvoiceCourseItem[];
    totalAmount: number;
    myCoursesUrl: string;
  }) {
    const content = generateSuccessfulOrderTemplate(
      customerName,
      orderId,
      orderDate,
      paymentMethod,
      courses,
      totalAmount,
      myCoursesUrl,
      "U Đê Mê",
      "123 Nguyen Van Linh, Q9, TP.HCM"
    );

    // Webhook SePay và nút "kiểm tra thanh toán" đều có thể dẫn tới đây cho cùng một đơn: chỉ gửi một mail
    return this.enqueue(
      { kind: 'order-paid', to: recipientEmail, subject: 'Xác nhận thanh toán thành công', html: content, idempotencyKey: `order-paid-${orderId}` },
      { jobId: `order-paid-${orderId}`, attempts: 8 },
    );
  }

  /** Mail của một chiến dịch gửi tới một người. jobId và idempotencyKey theo (chiến dịch, người) nên không bao giờ gửi trùng. */
  async enqueueCampaignMail(input: {
    campaignId: string;
    userId: string;
    to: string;
    subject: string;
    html: string;
    headers?: Record<string, string>;
    replyTo?: string;
  }) {
    const id = `campaign-${input.campaignId}-${input.userId}`;
    return this.enqueue(
      {
        kind: 'campaign',
        to: input.to,
        subject: input.subject,
        html: input.html,
        idempotencyKey: id,
        campaignId: input.campaignId,
        headers: input.headers,
        replyTo: input.replyTo,
      },
      { jobId: id, attempts: 5 },
    );
  }

  /** Gửi thử một chiến dịch cho chính người soạn: không tính vào bộ đếm chiến dịch và không cần đã duyệt. */
  async enqueueTestMail(input: { to: string; subject: string; html: string }) {
    return this.enqueue(
      { kind: 'campaign-test', to: input.to, subject: input.subject, html: input.html },
      { attempts: 3, priority: 2 },
    );
  }

  async sendNewLoginAlert({
    recipientEmail,
    userName,
    loginTime,
    userAgent,
    ipAddress,
  }: {
    recipientEmail: string;
    userName: string;
    loginTime: string;
    userAgent: string;
    ipAddress: string;
  }) {
    const content = generateNewLoginTemplate(
      userName,
      loginTime,
      userAgent,
      ipAddress,
      "U Đê Mê",
      "123 Nguyen Van Linh, Q9, TP.HCM",
    );
    return this.enqueue(
      { kind: 'login-alert', to: recipientEmail, subject: 'Đăng nhập mới vào tài khoản của bạn', html: content },
      { attempts: 5 },
    );
  }
}
