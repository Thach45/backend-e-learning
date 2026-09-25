import { overallProgress } from './progress';

describe('overallProgress', () => {
  it('chia cho tổng số bài của khóa, không phải số bài đã mở', () => {
    expect(overallProgress([100], 10)).toBe(10); // xem xong 1/10 bài
    expect(overallProgress([100, 50], 4)).toBe(38);
  });
  it('khóa chưa có bài nào thì 0%', () => {
    expect(overallProgress([100], 0)).toBe(0);
  });
  it('không vượt 100% và bỏ giá trị bất thường', () => {
    expect(overallProgress([100, 100, 100], 2)).toBe(100);
    expect(overallProgress([150, -20], 2)).toBe(50);
  });
  it('chưa học gì thì 0%', () => {
    expect(overallProgress([], 5)).toBe(0);
  });
});
