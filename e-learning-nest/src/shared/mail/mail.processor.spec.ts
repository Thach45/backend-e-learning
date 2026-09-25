// @nestjs/bullmq v12 chỉ phát hành ESM nên Jest (CJS) không nạp được; test này chỉ kiểm tra logic gửi, không cần framework
jest.mock('@nestjs/bullmq', () => ({
  Processor: () => () => undefined,
  OnWorkerEvent: () => () => undefined,
  WorkerHost: class {},
}));

import { DelayedError, UnrecoverableError } from 'bullmq';
import { CampaignSkippedError, MailProcessor } from './mail.processor';
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
    processor = new MailProcessor({ emailCampaign: { findUnique: jest.fn() } } as any, { get: jest.fn(), getClient: () => null } as any);
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


describe('MailProcessor: mail thuộc chiến dịch', () => {
  const env = { ...process.env };
  let fetchMock: jest.Mock;
  const mk = (campaign: unknown, used = 0) => {
    const prisma = { emailCampaign: { findUnique: jest.fn().mockResolvedValue(campaign) } } as any;
    const redis = { get: jest.fn().mockResolvedValue(String(used)), getClient: () => null } as any;
    return { processor: new MailProcessor(prisma, redis), prisma };
  };
  const cjob = () => {
    const j = job({ kind: 'campaign', campaignId: 'c-1', headers: { 'List-Unsubscribe': '<https://x/u>' }, replyTo: 'hotro@x.com' }) as any;
    j.moveToDelayed = jest.fn().mockResolvedValue(undefined);
    return j;
  };

  beforeEach(() => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.MAIL_FROM = 'T <t@x.com>';
    process.env.MAIL_DAILY_CAP = '10';
    process.env.MAIL_TRANSACTIONAL_RESERVE = '4';
    delete process.env.RESEND_API_URL;
    fetchMock = jest.fn();
    global.fetch = fetchMock as any;
  });
  afterEach(() => { process.env = { ...env }; });

  it('chiến dịch đã được duyệt và đang gửi: gửi kèm header và reply_to', async () => {
    const { processor } = mk({ status: 'SENDING', isApproved: true });
    fetchMock.mockReturnValue(reply(200, { id: 'ok' }));
    await expect(processor.process(cjob())).resolves.toEqual({ id: 'ok' });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.headers).toEqual({ 'List-Unsubscribe': '<https://x/u>' });
    expect(body.reply_to).toBe('hotro@x.com');
  });

  it('chiến dịch bị huỷ: bỏ qua, KHÔNG gọi Resend và không tính là lỗi gửi', async () => {
    const { processor } = mk({ status: 'CANCELLED', isApproved: false });
    const err: any = await processor.process(cjob()).catch((e) => e);
    expect(err).toBeInstanceOf(CampaignSkippedError);
    expect(err).toBeInstanceOf(UnrecoverableError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('chưa được duyệt (isApproved=false) thì không gửi dù trạng thái là SENDING (lớp an toàn thứ hai)', async () => {
    const { processor } = mk({ status: 'SENDING', isApproved: false });
    await expect(processor.process(cjob())).rejects.toBeInstanceOf(CampaignSkippedError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('chiến dịch không còn tồn tại (đã xoá) thì bỏ qua', async () => {
    const { processor } = mk(null);
    await expect(processor.process(cjob())).rejects.toBeInstanceOf(CampaignSkippedError);
  });

  it('hết hạn mức ngày cho chiến dịch (đã gửi >= cap - reserve): hoãn sang ngày sau, không gọi Resend', async () => {
    const { processor } = mk({ status: 'SENDING', isApproved: true }, 6); // 6 >= 10 - 4
    const j = cjob();
    await expect(processor.process(j, 'tok')).rejects.toBeInstanceOf(DelayedError);
    expect(j.moveToDelayed).toHaveBeenCalledWith(expect.any(Number), 'tok');
    expect(j.moveToDelayed.mock.calls[0][0]).toBeGreaterThan(Date.now());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('còn hạn mức (đã gửi < cap - reserve) thì gửi bình thường', async () => {
    const { processor } = mk({ status: 'SENDING', isApproved: true }, 5);
    fetchMock.mockReturnValue(reply(200, { id: 'ok' }));
    await expect(processor.process(cjob())).resolves.toEqual({ id: 'ok' });
  });

  it('mail giao dịch không bị hạn mức chiến dịch chặn và không cần tra chiến dịch', async () => {
    const { processor, prisma } = mk(null, 999);
    fetchMock.mockReturnValue(reply(200, { id: 'otp' }));
    await expect(processor.process(job())).resolves.toEqual({ id: 'otp' });
    expect(prisma.emailCampaign.findUnique).not.toHaveBeenCalled();
  });
});
