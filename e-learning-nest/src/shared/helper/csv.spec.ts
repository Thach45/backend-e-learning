import { parseCsv, toCsv } from './csv';

describe('parseCsv', () => {
  it('đọc ô thường, ô có dấu phẩy, xuống dòng và dấu nháy kép', () => {
    expect(parseCsv('a,b\r\n"x, y","dòng 1\ndòng 2","nói ""hi"""\n')).toEqual([['a', 'b'], ['x, y', 'dòng 1\ndòng 2', 'nói "hi"']]);
  });
  it('bỏ BOM và dòng trống, chịu được CRLF/LF lẫn lộn', () => {
    expect(parseCsv('﻿a,b\n\n1,2\r\n3,4')).toEqual([['a', 'b'], ['1', '2'], ['3', '4']]);
  });
  it('giữ ô rỗng ở giữa và cuối', () => {
    expect(parseCsv('a,,c,\n')).toEqual([['a', '', 'c', '']]);
  });
  it('khứ hồi với toCsv, kể cả ô bắt đầu bằng công thức', () => {
    const rows = [['=SUM(A1)', 'a,b', '"q"', 'dòng\nmới', '']];
    expect(parseCsv(toCsv(['h1', 'h2', 'h3', 'h4', 'h5'], rows)).slice(1)).toEqual(rows);
  });
});
