import { createHmac } from 'crypto';
import { escapeHtml, fillSubject, fillVariables, markdownToHtml, renderCampaignEmail } from '../../shared/mail/render.util';
import { signUnsubscribeToken, verifyUnsubscribeToken } from './unsubscribe-token.util';
import { verifyResendWebhook } from './resend-webhook.util';

describe('markdownToHtml (chống chèn HTML)', () => {
  it('escape toàn bộ HTML người dùng nhập', () => {
    const html = markdownToHtml('<script>alert(1)</script> <img src=x onerror=alert(1)> "quote"');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&quot;quote&quot;');
  });

  it('chỉ cho link https và mailto, chặn javascript: và data:', () => {
    expect(markdownToHtml('[ok](https://example.com/a?x=1&y=2)')).toContain('href="https://example.com/a?x=1&amp;y=2"');
    expect(markdownToHtml('[mail](mailto:a@b.com)')).toContain('href="mailto:a@b.com"');
    expect(markdownToHtml('[bad](javascript:alert(1))')).not.toContain('href=');
    expect(markdownToHtml('[bad](data:text/html;base64,AAAA)')).not.toContain('href=');
    expect(markdownToHtml('[bad](http://insecure.example.com)')).not.toContain('href=');
  });

  it('không thoát ra khỏi thuộc tính href bằng dấu nháy', () => {
    const html = markdownToHtml('[x](https://e.com/"onmouseover="alert(1))');
    expect(html).not.toMatch(/href="[^"]*"\s*onmouseover/);
  });

  it('hỗ trợ tiêu đề, đậm, nghiêng, danh sách, đường kẻ', () => {
    const html = markdownToHtml('## Tiêu đề\n\nĐoạn **đậm** và *nghiêng*\ndòng hai\n\n- một\n- hai\n\n1. a\n2. b\n\n---');
    expect(html).toContain('<h2');
    expect(html).toContain('<strong>đậm</strong>');
    expect(html).toContain('<em>nghiêng</em>');
    expect(html).toContain('<br>');
    expect(html.match(/<li/g)).toHaveLength(4);
    expect(html).toContain('<ul');
    expect(html).toContain('<ol');
    expect(html).toContain('<hr');
  });
});

describe('biến trong thư', () => {
  it('giá trị biến bị escape (tên người dùng không chèn được HTML)', () => {
    const html = fillVariables('<p>Chào {{name}}</p>', { name: '<b onclick="x">Ha</b>' });
    expect(html).not.toContain('<b ');
    expect(html).toContain('&lt;b onclick=&quot;x&quot;&gt;');
  });
  it('biến không có giá trị thì để trống', () => {
    expect(fillVariables('Khóa {{courseTitle}}!', {})).toBe('Khóa !');
  });
  it('tiêu đề: bỏ xuống dòng để không chèn được header thư', () => {
    expect(fillSubject('Chào {{name}}', { name: 'A\r\nBcc: evil@x.com' })).toBe('Chào A Bcc: evil@x.com');
  });
  it('escapeHtml xử lý & < > " \'', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });
});

describe('renderCampaignEmail', () => {
  const base = { bodyHtml: '<p>Xin chào {{name}}</p>', vars: { name: 'An' }, senderLabel: 'Ban quản trị', isServiceNotice: false };
  it('có link ngừng nhận thư cho thư thường', () => {
    const html = renderCampaignEmail({ ...base, unsubscribeUrl: 'https://x.com/unsubscribe?token=a.b' });
    expect(html).toContain('Ngừng nhận thư này');
    expect(html).toContain('Xin chào An');
  });
  it('thông báo dịch vụ ghi rõ, không có link ngừng nhận', () => {
    const html = renderCampaignEmail({ ...base, isServiceNotice: true });
    expect(html).toContain('thông báo dịch vụ');
    expect(html).not.toContain('Ngừng nhận thư này');
  });
});

describe('token ngừng nhận thư', () => {
  const id = '2f59981a-721a-480e-a803-dc0994875b38';
  beforeAll(() => { process.env.ACCESS_TOKEN_SECRET = 'test-secret'; });

  it('ký rồi xác minh ra đúng userId', () => {
    expect(verifyUnsubscribeToken(signUnsubscribeToken(id))).toBe(id);
  });
  it('từ chối token bị sửa, giả mạo hoặc rác', () => {
    const t = signUnsubscribeToken(id);
    const other = signUnsubscribeToken('b811941b-2792-4608-9ad1-816c04d8dfb1');
    expect(verifyUnsubscribeToken(t.slice(0, -2) + 'xx')).toBeNull();
    expect(verifyUnsubscribeToken(`${other.split('.')[0]}.${t.split('.')[1]}`)).toBeNull(); // đổi userId, giữ chữ ký cũ
    expect(verifyUnsubscribeToken('abc')).toBeNull();
    expect(verifyUnsubscribeToken(undefined)).toBeNull();
    expect(verifyUnsubscribeToken('x'.repeat(400))).toBeNull();
  });
});

describe('chữ ký webhook Resend (Svix)', () => {
  const secretRaw = Buffer.from('super-secret-key-1234567890').toString('base64');
  const secret = `whsec_${secretRaw}`;
  const body = '{"type":"email.bounced","data":{"to":["a@b.com"]}}';
  const sign = (id: string, ts: string, b: string) =>
    createHmac('sha256', Buffer.from(secretRaw, 'base64')).update(`${id}.${ts}.${b}`).digest('base64');
  const now = Date.now();
  const ts = String(Math.floor(now / 1000));

  it('chấp nhận chữ ký đúng (kể cả khi có nhiều chữ ký)', () => {
    const good = `v1,${sign('msg_1', ts, body)}`;
    expect(verifyResendWebhook({ secret, id: 'msg_1', timestamp: ts, signature: good, rawBody: body, now })).toBe(true);
    expect(verifyResendWebhook({ secret, id: 'msg_1', timestamp: ts, signature: `v1,AAAA ${good}`, rawBody: body, now })).toBe(true);
  });
  it('từ chối khi sai nội dung, sai id, sai bí mật hoặc thiếu header', () => {
    const good = `v1,${sign('msg_1', ts, body)}`;
    expect(verifyResendWebhook({ secret, id: 'msg_1', timestamp: ts, signature: good, rawBody: body + ' ', now })).toBe(false);
    expect(verifyResendWebhook({ secret, id: 'msg_2', timestamp: ts, signature: good, rawBody: body, now })).toBe(false);
    expect(verifyResendWebhook({ secret: 'whsec_' + Buffer.from('other').toString('base64'), id: 'msg_1', timestamp: ts, signature: good, rawBody: body, now })).toBe(false);
    expect(verifyResendWebhook({ secret, id: undefined, timestamp: ts, signature: good, rawBody: body, now })).toBe(false);
    expect(verifyResendWebhook({ secret: '', id: 'msg_1', timestamp: ts, signature: good, rawBody: body, now })).toBe(false);
  });
  it('từ chối bản ghi cũ hơn 5 phút (chống replay)', () => {
    const old = String(Math.floor(now / 1000) - 6 * 60);
    expect(verifyResendWebhook({ secret, id: 'msg_1', timestamp: old, signature: `v1,${sign('msg_1', old, body)}`, rawBody: body, now })).toBe(false);
  });
});
