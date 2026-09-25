export const MAX_SUBTITLE_CHARS = 300_000;

/**
 * Chuẩn hoá phụ đề tải lên về WebVTT sạch: nhận .vtt hoặc .srt, bỏ BOM, đổi xuống dòng, xoá mọi thẻ HTML/XML
 * (player có thể dựng cue thành HTML nên không để lọt `<script>`, `<img onerror>`...). Ném Error có thông điệp tiếng Việt nếu không hợp lệ.
 */
export function normalizeSubtitle(raw: string): string {
  if (raw.length > MAX_SUBTITLE_CHARS) throw new Error('Phụ đề quá lớn (tối đa khoảng 300.000 ký tự).');
  let text = raw.replace(/^﻿/, '').replace(/\r\n?/g, '\n').trim();
  if (!/-->/.test(text)) throw new Error('Không tìm thấy mốc thời gian (dạng 00:00:01.000 --> 00:00:03.000).');
  if (!/^WEBVTT/.test(text)) {
    // SRT: dấu phẩy ở phần mili giây phải thành dấu chấm
    text = 'WEBVTT\n\n' + text.replace(/(\d{1,2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
  }
  text = text.replace(/<\/?[a-zA-Z!?][^>]*>/g, '');
  const cues = text.match(/\d{1,2}:\d{2}(?::\d{2})?\.\d{3}\s+-->\s+\d{1,2}:\d{2}(?::\d{2})?\.\d{3}/g);
  if (!cues) throw new Error('Không có dòng thời gian hợp lệ nào (cần dạng 00:00:01.000 --> 00:00:03.000).');
  return text + '\n';
}
