/** Giá đang hiển thị của một khoá: giá khuyến mãi nếu có (khác 0), không thì giá gốc. Khớp với cách trang danh sách hiển thị. */
export const effectivePrice = (c: { price: number; salePrice: number | null }) => c.salePrice || c.price;

/** Sắp xếp theo giá hiển thị; giá bằng nhau thì khoá mới hơn đứng trước để thứ tự ổn định giữa các trang. */
export function sortByEffectivePrice<T extends { price: number; salePrice: number | null; createdAt: Date }>(rows: T[], direction: 'asc' | 'desc'): T[] {
  const sign = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => sign * (effectivePrice(a) - effectivePrice(b)) || b.createdAt.getTime() - a.createdAt.getTime());
}

/** Tách chuỗi `id1,id2` thành mảng id (bỏ trùng, bỏ rỗng). */
export const splitIds = (raw: string): string[] => [...new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))];
