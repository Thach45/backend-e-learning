export const MAIL_QUEUE = 'mail';
export const SEND_MAIL_JOB = 'send';

export type MailKind = 'otp' | 'order-created' | 'order-paid' | 'login-alert' | 'campaign' | 'campaign-test';

/** Dữ liệu một job gửi mail. HTML đã render sẵn lúc thêm job để mọi lần retry gửi đúng cùng một nội dung. */
export interface MailJobData {
  kind: MailKind;
  to: string;
  subject: string;
  html: string;
  /** Resend giữ khóa này 24 giờ: retry (hoặc worker bị dừng giữa chừng) không làm người nhận nhận 2 mail. */
  idempotencyKey: string;
  /** Sau thời điểm này (ms epoch) job bị bỏ, không gửi nữa. Dùng cho OTP đã hết hạn. */
  expiresAt?: number;
  /** Mail thuộc một chiến dịch: worker kiểm tra lại trạng thái duyệt, chịu hạn mức ngày và cập nhật bộ đếm. */
  campaignId?: string;
  /** Header tuỳ chỉnh (List-Unsubscribe...). */
  headers?: Record<string, string>;
  replyTo?: string;
}
