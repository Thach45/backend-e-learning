// @nestjs/bullmq v12 chỉ phát hành ESM nên Jest (CJS) không nạp được; test này chỉ kiểm tra logic gửi, không cần framework
jest.mock('@nestjs/bullmq', () => ({
  Processor: () => () => undefined,
  OnWorkerEvent: () => () => undefined,
  WorkerHost: class {},
}));

import { UnrecoverableError } from 'bullmq';
import { MailProcessor } from './mail.processor';
import { MailJobData } from './mail.constants';

const job = (over: Partial<MailJobData> = {}) =>
  ({
    id: '1',
    data: { kind: 'otp', to: 'a@b.com', subject: 'S', html: '<p>x</p>', idempotencyKey: 'key-1', ...over },
  }) as any;

const reply = (status: number, body: unknown = {}) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) } as Response);

describe('MailProcessor', () => {
  const env = { ...process.env };
  let processor: MailProcessor;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.MAIL_FROM = 'E-Learning <learn@arionxai.com>';
    delete process.env.RESEND_API_URL;
    fetchMock = jest.fn();
    global.fetch = fetchMock as any;
    processor = new MailProcessor();
  });
  afterEach(() => {
    process.env = { ...env };
  });

  it('gửi đúng request tới Resend kèm Idempotency-Key', async () => {
    fetchMock.mockReturnValue(reply(200, { id: 'abc' }));
    await expect(processor.process(job())).resolves.toEqual({ id: 'abc' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers['Idempotency-Key']).toBe('key-1');
    expect(init.headers.Authorization).toBe('Bearer re_test');
    expect(JSON.parse(init.body)).toEqual({
      from: 'E-Learning <learn@arionxai.com>',
      to: ['a@b.com'],
      subject: 'S',
      html: '<p>x</p>',
    });
  });

  it.each([429, 500, 503, 409])('lỗi tạm thời %i thì ném lỗi thường để BullMQ retry', async (status) => {
    fetchMock.mockReturnValue(reply(status, { message: 'tạm thời' }));
    const err = await processor.process(job()).catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(UnrecoverableError);
  });

  it.each([400, 401, 403, 422])('lỗi vĩnh viễn %i thì UnrecoverableError (không retry)', async (status) => {
    fetchMock.mockReturnValue(reply(status, { message: 'sai' }));
    await expect(processor.process(job())).rejects.toBeInstanceOf(UnrecoverableError);
  });

  it('lỗi mạng/timeout thì retry', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNRESET'));
    const err = await processor.process(job()).catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(UnrecoverableError);
  });

  it('bỏ qua mail đã quá hạn (OTP hết hạn), không gọi Resend', async () => {
    await expect(processor.process(job({ expiresAt: Date.now() - 1 }))).rejects.toBeInstanceOf(UnrecoverableError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('thiếu cấu hình thì UnrecoverableError, không gọi Resend', async () => {
    delete process.env.RESEND_API_KEY;
    await expect(processor.process(job())).rejects.toBeInstanceOf(UnrecoverableError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('không để lộ nội dung mail hay khóa API trong thông báo lỗi', async () => {
    fetchMock.mockReturnValue(reply(422, { message: 'Invalid `to` field' }));
    const err = await processor.process(job({ html: 'OTP-123456' })).catch((e) => e);
    expect(err.message).not.toContain('OTP-123456');
    expect(err.message).not.toContain('re_test');
  });
});
