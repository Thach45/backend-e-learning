const ORDER_REF_PATTERN =
  /orderid\s+([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|[a-f0-9]{32})/i;

/**
 * Lấy id đơn hàng (UUID) từ nội dung chuyển khoản dạng "OrderID <uuid>".
 * Ngân hàng đôi khi bỏ dấu gạch ngang hoặc đổi chữ hoa/thường nên chấp nhận cả dạng 32 ký tự liền.
 */
export function extractOrderIdFromContent(content?: string | null): string | null {
  if (!content) return null;
  const match = content.match(ORDER_REF_PATTERN);
  if (!match) return null;

  const raw = match[1].toLowerCase();
  if (raw.length !== 32) return raw;
  return [raw.slice(0, 8), raw.slice(8, 12), raw.slice(12, 16), raw.slice(16, 20), raw.slice(20)].join('-');
}
