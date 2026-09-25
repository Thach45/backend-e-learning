import { createHmac, timingSafeEqual } from 'crypto';

const secret = () => {
  const s = process.env.UNSUBSCRIBE_SECRET || process.env.ACCESS_TOKEN_SECRET;
  if (!s) throw new Error('Thiếu UNSUBSCRIBE_SECRET (hoặc ACCESS_TOKEN_SECRET) để ký liên kết ngừng nhận thư');
  return s;
};

const sig = (userId: string) => createHmac('sha256', secret()).update(`unsubscribe:${userId}`).digest('base64url');

/** Token không hết hạn (liên kết huỷ đăng ký phải luôn dùng được), nhưng không đoán/giả mạo được vì có chữ ký HMAC. */
export function signUnsubscribeToken(userId: string): string {
  return `${Buffer.from(userId).toString('base64url')}.${sig(userId)}`;
}

export function verifyUnsubscribeToken(token: string | undefined): string | null {
  if (!token || token.length > 300) return null;
  const [idPart, sigPart] = token.split('.');
  if (!idPart || !sigPart) return null;
  let userId: string;
  try {
    userId = Buffer.from(idPart, 'base64url').toString('utf8');
  } catch {
    return null;
  }
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return null;
  const expected = Buffer.from(sig(userId));
  const given = Buffer.from(sigPart);
  return expected.length === given.length && timingSafeEqual(expected, given) ? userId : null;
}
