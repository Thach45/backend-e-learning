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

/** Đọc CSV (RFC 4180): ô có ngoặc kép, dấu phẩy/xuống dòng trong ô, "" là dấu nháy. Bỏ BOM và dòng trống. Hoàn tác dấu ' chống formula do toCsv thêm. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const pushCell = () => {
    row.push(/^'[=+\-@\t\r]/.test(cell) ? cell.slice(1) : cell);
    cell = '';
  };
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += ch;
    } else if (ch === '"' && cell === '') quoted = true;
    else if (ch === ',') pushCell();
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      pushCell();
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
    } else cell += ch;
  }
  pushCell();
  if (row.some((c) => c.trim() !== '')) rows.push(row);
  return rows;
}
