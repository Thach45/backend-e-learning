/**
 * Tiến độ tổng của một học viên trong một khóa học: tổng % của từng bài chia cho SỐ BÀI CỦA KHÓA (không chỉ các bài đã mở).
 * Trước đây chia cho số bài đã có bản ghi nên học viên mới xem một bài đã thấy 100% cả khóa.
 */
export function overallProgress(progressPercents: number[], totalLessons: number): number {
  if (totalLessons <= 0) return 0;
  const sum = progressPercents.reduce((a, b) => a + Math.max(0, Math.min(100, b)), 0);
  return Math.min(100, Math.round(sum / totalLessons));
}
