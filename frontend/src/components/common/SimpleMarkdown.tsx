import { Fragment, type ReactNode } from 'react';

/**
 * Bộ hiển thị markdown tối giản cho nội dung tĩnh do chính dự án soạn (điều khoản, chính sách).
 * Hỗ trợ: # ## ###, đoạn văn, danh sách -, 1., > trích dẫn, bảng |, ---, **đậm**, *nghiêng*, `mã`, [chữ](https://...).
 * Render bằng phần tử React (không dùng dangerouslySetInnerHTML) nên không thể chèn HTML/script.
 */

const SAFE_HREF = /^(https:\/\/|mailto:|\/)/;

function inline(text: string, highlight: boolean, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  // thứ tự ưu tiên: [[chỗ trống]], `mã`, **đậm**, *nghiêng*, [chữ](link)
  const re = /(\[\[[^\]]+\]\])|(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyPrefix}-${i++}`;
    if (m[1]) {
      out.push(
        highlight ? (
          <mark key={key} className="bg-yellow-200 text-yellow-900 px-1 rounded">{tok.slice(2, -2)}</mark>
        ) : (
          tok
        ),
      );
    } else if (m[2]) out.push(<code key={key} className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[0.9em]">{tok.slice(1, -1)}</code>);
    else if (m[3]) out.push(<strong key={key}>{inline(tok.slice(2, -2), highlight, key)}</strong>);
    else if (m[4]) out.push(<em key={key}>{inline(tok.slice(1, -1), highlight, key)}</em>);
    else if (m[5]) {
      const [, label, href] = /\[([^\]]+)\]\(([^)\s]+)\)/.exec(tok)!;
      out.push(
        SAFE_HREF.test(href) ? (
          <a key={key} href={href} className="text-indigo-600 hover:underline" {...(href.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {label}
          </a>
        ) : (
          label
        ),
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cells = (line: string) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

export default function SimpleMarkdown({ source, highlightPlaceholders = false }: { source: string; highlightPlaceholders?: boolean }) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const cls = level === 1 ? 'text-3xl font-bold mt-2 mb-4' : level === 2 ? 'text-xl font-semibold mt-8 mb-3' : 'text-lg font-semibold mt-6 mb-2';
      const Tag = (`h${level}`) as 'h1' | 'h2' | 'h3';
      blocks.push(<Tag key={k++} className={`${cls} text-slate-900 dark:text-slate-50`}>{inline(h[2], highlightPlaceholders, `h${k}`)}</Tag>);
      i++; continue;
    }
    if (/^---+$/.test(line.trim())) { blocks.push(<hr key={k++} className="my-6 border-slate-200 dark:border-slate-800" />); i++; continue; }

    if (line.startsWith('>')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) buf.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push(<blockquote key={k++} className="border-l-4 border-indigo-300 bg-indigo-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-4 py-3 my-4 rounded-r-lg text-sm">{inline(buf.join(' '), highlightPlaceholders, `q${k}`)}</blockquote>);
      continue;
    }

    if (line.trim().startsWith('|') && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1] ?? '')) {
      const head = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(cells(lines[i++]));
      blocks.push(
        <div key={k++} className="overflow-x-auto my-4">
          <table className="w-full text-sm border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>{head.map((c, ci) => <th key={ci} className="text-left px-3 py-2 font-semibold border-b border-slate-200 dark:border-slate-800">{inline(c, highlightPlaceholders, `th${k}${ci}`)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className="border-b border-slate-100 dark:border-slate-800 align-top">
                  {r.map((c, ci) => <td key={ci} className="px-3 py-2">{inline(c, highlightPlaceholders, `td${k}${ri}${ci}`)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const ul = /^\s*[-*]\s+/.test(line);
    const ol = /^\s*\d+\.\s+/.test(line);
    if (ul || ol) {
      const items: string[] = [];
      const re = ul ? /^\s*[-*]\s+/ : /^\s*\d+\.\s+/;
      while (i < lines.length && re.test(lines[i])) items.push(lines[i++].replace(re, ''));
      const Tag = ul ? 'ul' : 'ol';
      blocks.push(
        <Tag key={k++} className={`${ul ? 'list-disc' : 'list-decimal'} pl-6 my-3 space-y-1`}>
          {items.map((it, ii) => <li key={ii}>{inline(it, highlightPlaceholders, `li${k}${ii}`)}</li>)}
        </Tag>,
      );
      continue;
    }

    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|>|\s*[-*]\s|\s*\d+\.\s|---+$|\|)/.test(lines[i])) buf.push(lines[i++]);
    blocks.push(<p key={k++} className="my-3 leading-relaxed">{inline(buf.join(' '), highlightPlaceholders, `p${k}`)}</p>);
  }

  return <Fragment>{blocks}</Fragment>;
}
