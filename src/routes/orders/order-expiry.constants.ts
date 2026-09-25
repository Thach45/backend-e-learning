export const ORDER_EXPIRY_QUEUE = 'order-expiry';
/** Job hẹn giờ cho từng đơn: hết hạn thanh toán thì hủy đơn. jobId = `expire-<orderId>`. */
export const EXPIRE_JOB = 'expire';
/** Job quét lặp định kỳ: lưới an toàn nếu Redis mất các job hẹn giờ. */
export const SWEEP_JOB = 'sweep';
export const SWEEP_EVERY_MS = 60_000;
export const expireJobId = (orderId: string) => `expire-${orderId}`;
