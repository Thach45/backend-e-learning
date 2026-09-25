export const EMAIL_CAMPAIGN_QUEUE = 'email-campaign';
/** Phân giải người nhận và đưa từng mail vào hàng đợi `mail`. jobId = dispatch-<campaignId>. */
export const DISPATCH_JOB = 'dispatch';
/** Quét lặp định kỳ: lưới an toàn nếu Redis mất job hẹn giờ của chiến dịch đã lên lịch. */
export const SWEEP_JOB = 'sweep';
export const SWEEP_EVERY_MS = 60_000;
export const dispatchJobId = (campaignId: string) => `dispatch-${campaignId}`;
