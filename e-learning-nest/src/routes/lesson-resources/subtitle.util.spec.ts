import { normalizeSubtitle } from './subtitle.util';

describe('normalizeSubtitle', () => {
  const vtt = 'WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nXin chào\n';

  it('giữ nguyên WebVTT hợp lệ', () => {
    expect(normalizeSubtitle(vtt)).toBe(vtt);
  });
  it('đổi SRT sang WebVTT (dấu phẩy thành dấu chấm)', () => {
    const out = normalizeSubtitle('1\r\n00:00:01,500 --> 00:00:03,250\r\nHello\r\n');
    expect(out.startsWith('WEBVTT\n\n')).toBe(true);
    expect(out).toContain('00:00:01.500 --> 00:00:03.250');
    expect(out).not.toContain('\r');
  });
  it('bỏ BOM', () => {
    expect(normalizeSubtitle('﻿' + vtt).startsWith('WEBVTT')).toBe(true);
  });
  it('xoá thẻ HTML/script nhưng giữ chữ', () => {
    const out = normalizeSubtitle('WEBVTT\n\n00:00:01.000 --> 00:00:03.000\n<b>Đậm</b> <img src=x onerror=alert(1)> <script>alert(1)</script>ok\n');
    expect(out).not.toMatch(/<|onerror=alert\(1\)>/);
    expect(out).toContain('Đậm');
    expect(out).toContain('ok');
  });
  it('từ chối văn bản không có mốc thời gian', () => {
    expect(() => normalizeSubtitle('WEBVTT\n\nchỉ là chữ')).toThrow();
    expect(() => normalizeSubtitle('hello world')).toThrow();
  });
  it('từ chối file quá lớn', () => {
    expect(() => normalizeSubtitle(vtt + 'x'.repeat(300_001))).toThrow(/quá lớn/);
  });
});
