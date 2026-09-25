/**
 * Tạo nội dung CSV (UTF-8 có BOM để Excel hiển thị đúng tiếng Việt).
 * Ô bắt đầu bằng = + - @ được chèn dấu ' phía trước để tránh CSV/formula injection khi mở bằng Excel.
 */
export type CsvValue = string | number | boolean | Date | null | undefined;

const FORMULA_START = /^[=+\-@\t\r]/;

function escapeCell(value: CsvValue): string {
  if (value === null || value === undefined) return '';
  let text = value instanceof Date ? value.toISOString() : String(value);
  // Số âm hợp lệ không cần bị coi là công thức
  if (typeof value !== 'number' && FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(headers: string[], rows: CsvValue[][]): string {
  const lines = [headers.map(escapeCell).join(','), ...rows.map((row) => row.map(escapeCell).join(','))];
  return '﻿' + lines.join('\r\n');
}
