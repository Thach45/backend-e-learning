import { effectivePrice, sortByEffectivePrice, splitIds } from './course-sort.util';

const d = (n: number) => new Date(2026, 0, n);
const row = (id: string, price: number, salePrice: number | null, day: number) => ({ id, price, salePrice, createdAt: d(day) });

describe('course-sort', () => {
  it('giá hiển thị: khuyến mãi nếu có, 0 coi như không khuyến mãi', () => {
    expect(effectivePrice({ price: 500, salePrice: 300 })).toBe(300);
    expect(effectivePrice({ price: 500, salePrice: null })).toBe(500);
    expect(effectivePrice({ price: 500, salePrice: 0 })).toBe(500);
  });

  it('sắp xếp theo giá hiển thị tăng/giảm, không phải giá gốc', () => {
    const rows = [row('a', 500, 100, 1), row('b', 200, null, 2), row('c', 900, null, 3)];
    expect(sortByEffectivePrice(rows, 'asc').map((r) => r.id)).toEqual(['a', 'b', 'c']);
    expect(sortByEffectivePrice(rows, 'desc').map((r) => r.id)).toEqual(['c', 'b', 'a']);
  });

  it('giá bằng nhau thì khoá mới hơn trước, và không làm thay đổi mảng gốc', () => {
    const rows = [row('old', 100, null, 1), row('new', 100, null, 9)];
    expect(sortByEffectivePrice(rows, 'asc').map((r) => r.id)).toEqual(['new', 'old']);
    expect(rows.map((r) => r.id)).toEqual(['old', 'new']);
  });

  it('splitIds bỏ trùng, khoảng trắng và phần rỗng', () => {
    expect(splitIds('a, b,,a ,c')).toEqual(['a', 'b', 'c']);
    expect(splitIds('')).toEqual([]);
  });
});
