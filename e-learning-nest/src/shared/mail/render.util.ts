/**
 * Soạn thư bằng markdown tối giản rồi render sang HTML ở server. Mọi ký tự người dùng nhập đều được ESCAPE TRƯỚC,
 * sau đó mới thêm thẻ HTML do chính hàm này tạo, nên không thể chèn script, iframe, form hay thuộc tính tuỳ ý.
 * Hỗ trợ: ## ### tiêu đề, đoạn văn, - và 1. danh sách, --- đường kẻ, **đậm**, *nghiêng*, [chữ](https://link) hoặc mailto:.
 */

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const SAFE_LINK = /^(https:\/\/|mailto:)/i;

function inline(escaped: string): string {
  return escaped
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, href: string) => {
      // href đã bị escape (&amp; &quot;): giải mã đúng phần & để kiểm tra scheme, rồi giữ nguyên dạng escape khi xuất
      return SAFE_LINK.test(href.replace(/&amp;/g, '&')) ? `<a href="${href}" style="color:#4f46e5">${label}</a>` : label;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*(?!\*)/g, '$1<em>$2</em>');
}

export function markdownToHtml(markdown: string): string {
  const lines = escapeHtml(markdown.replace(/\r\n/g, '\n')).split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const h = /^(#{2,3})\s+(.*)$/.exec(line);
    if (h) {
      const tag = h[1].length === 2 ? 'h2' : 'h3';
      const size = tag === 'h2' ? '20px' : '17px';
      out.push(`<${tag} style="margin:24px 0 8px;font-size:${size};color:#0f172a">${inline(h[2])}</${tag}>`);
      i++; continue;
    }
    if (/^---+$/.test(line.trim())) { out.push('<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">'); i++; continue; }

    const ul = /^\s*[-*]\s+/.test(line);
    const ol = /^\s*\d+\.\s+/.test(line);
    if (ul || ol) {
      const re = ul ? /^\s*[-*]\s+/ : /^\s*\d+\.\s+/;
      const items: string[] = [];
      while (i < lines.length && re.test(lines[i])) items.push(`<li style="margin:4px 0">${inline(lines[i++].replace(re, ''))}</li>`);
      const tag = ul ? 'ul' : 'ol';
      out.push(`<${tag} style="margin:12px 0;padding-left:22px">${items.join('')}</${tag}>`);
      continue;
    }

    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|\s*[-*]\s|\s*\d+\.\s|---+$)/.test(lines[i])) buf.push(inline(lines[i++]));
    out.push(`<p style="margin:12px 0;line-height:1.6">${buf.join('<br>')}</p>`);
  }
  return out.join('\n');
}

/** Thay {{name}}, {{courseTitle}} trong HTML ĐÃ render: giá trị được escape nên tên người dùng không thể chèn HTML. */
export function fillVariables(html: string, vars: Record<string, string | undefined>): string {
  return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) => escapeHtml(vars[key] ?? ''));
}

/** Tiêu đề là văn bản thuần: thay biến và bỏ ký tự xuống dòng (chống chèn header thư). */
export function fillSubject(subject: string, vars: Record<string, string | undefined>): string {
  return subject
    .replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) => vars[key] ?? '')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

export interface RenderInput {
  bodyHtml: string; // đã qua markdownToHtml
  vars: Record<string, string | undefined>;
  senderLabel: string;
  unsubscribeUrl?: string;
  isServiceNotice: boolean;
  companyAddress?: string;
  /** Thư thông báo cá nhân (chấm bài, phản hồi hỗ trợ...): thay dòng chân thư mặc định. */
  footerText?: string;
}

export function renderCampaignEmail(input: RenderInput): string {
  const content = fillVariables(input.bodyHtml, input.vars);
  const address = input.companyAddress ? `<br>${escapeHtml(input.companyAddress)}` : '';
  const footer = input.footerText
    ? escapeHtml(input.footerText)
    : input.unsubscribeUrl
    ? `Bạn nhận thư này vì có tài khoản tại U Đê Mê. <a href="${escapeHtml(input.unsubscribeUrl)}" style="color:#64748b">Ngừng nhận thư này</a>.`
    : input.isServiceNotice
      ? 'Đây là thông báo dịch vụ từ U Đê Mê gửi tới tất cả người dùng.'
      : 'Bạn nhận thư này vì có tài khoản tại U Đê Mê.';

  return `<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Helvetica,Arial,sans-serif;color:#334155">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:24px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden">
    <tr><td style="background:#4f46e5;padding:20px 28px;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:1px">U Đê Mê</td></tr>
    <tr><td style="padding:24px 28px;font-size:15px">${content}
      <p style="margin:28px 0 0;font-size:13px;color:#64748b">— ${escapeHtml(input.senderLabel)}</p>
    </td></tr>
    <tr><td style="padding:16px 28px;background:#f8fafc;font-size:12px;color:#94a3b8;line-height:1.5">${footer}${address}</td></tr>
  </table>
</td></tr></table></body></html>`;
}
