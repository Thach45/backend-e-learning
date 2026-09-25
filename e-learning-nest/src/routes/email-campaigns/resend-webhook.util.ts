import { createHmac, timingSafeEqual } from 'crypto';

const TOLERANCE_SECONDS = 5 * 60;

/**
 * Kiểm tra chữ ký webhook của Resend (chuẩn Svix):
 *   signedContent = `${svix-id}.${svix-timestamp}.${rawBody}`
 *   signature     = base64(HMAC-SHA256(base64decode(secret sau "whsec_"), signedContent))
 * Header svix-signature có dạng "v1,<sig> v1,<sig>" (có thể nhiều chữ ký khi đang xoay khoá).
 */
export function verifyResendWebhook(params: {
  secret: string;
  id?: string;
  timestamp?: string;
  signature?: string;
  rawBody: string;
  now?: number;
}): boolean {
  const { secret, id, timestamp, signature, rawBody } = params;
  if (!secret || !id || !timestamp || !signature) return false;

  const ts = Number(timestamp);
  const nowSec = Math.floor((params.now ?? Date.now()) / 1000);
  if (!Number.isFinite(ts) || Math.abs(nowSec - ts) > TOLERANCE_SECONDS) return false; // chống replay

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${rawBody}`).digest();

  return signature.split(' ').some((part) => {
    const [version, sig] = part.split(',');
    if (version !== 'v1' || !sig) return false;
    const given = Buffer.from(sig, 'base64');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}
