import { ServiceUnavailableException } from '@nestjs/common';
import { MaintenanceGuard } from './maintenance.guard';

const ctx = (path: string, user?: { roleName: string }, type = 'http') => {
  const setHeader = jest.fn();
  return {
    context: {
      getType: () => type,
      switchToHttp: () => ({ getRequest: () => ({ path, user }), getResponse: () => ({ setHeader }) }),
    } as any,
    setHeader,
  };
};

const settingsWith = (over: Record<string, unknown>) =>
  ({ getSettings: jest.fn().mockResolvedValue({ maintenanceEnabled: true, maintenanceMessage: 'Đang nâng cấp', maintenanceUntil: null, ...over }) }) as any;

describe('MaintenanceGuard', () => {
  it('không bảo trì thì cho qua mọi request', async () => {
    const guard = new MaintenanceGuard(settingsWith({ maintenanceEnabled: false }));
    await expect(guard.canActivate(ctx('/api/courses').context)).resolves.toBe(true);
  });

  it('bảo trì: người thường và khách nhận 503 MAINTENANCE kèm Retry-After', async () => {
    const guard = new MaintenanceGuard(settingsWith({ maintenanceUntil: new Date('2026-10-01T00:00:00Z') }));
    const { context, setHeader } = ctx('/api/courses', { roleName: 'CLIENT' });
    const err: any = await guard.canActivate(context).catch((e) => e);
    expect(err).toBeInstanceOf(ServiceUnavailableException);
    expect(err.getResponse()).toMatchObject({ statusCode: 503, code: 'MAINTENANCE', message: 'Đang nâng cấp', until: '2026-10-01T00:00:00.000Z' });
    expect(setHeader).toHaveBeenCalledWith('Retry-After', '300');
    await expect(guard.canActivate(ctx('/api/courses').context)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('bảo trì: admin vẫn dùng bình thường', async () => {
    const guard = new MaintenanceGuard(settingsWith({}));
    await expect(guard.canActivate(ctx('/api/admin/users', { roleName: 'ADMIN' }).context)).resolves.toBe(true);
  });

  it.each([
    '/api/health',
    '/api/health/ready',
    '/api/webhooks/sepay',
    '/api/webhook/video-done',
    '/api/settings/public',
    '/api/auth/login',
    '/api/auth/refresh-token',
  ])('bảo trì: %s luôn được cho qua', async (path) => {
    const guard = new MaintenanceGuard(settingsWith({}));
    await expect(guard.canActivate(ctx(path).context)).resolves.toBe(true);
  });

  it('không cho qua đường dẫn chỉ giống tiền tố (chống lách whitelist)', async () => {
    const guard = new MaintenanceGuard(settingsWith({}));
    await expect(guard.canActivate(ctx('/api/healthcheck-evil').context)).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(guard.canActivate(ctx('/api/authors').context)).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(guard.canActivate(ctx('/api/settings/public/../admin').context)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('fail-open: lỗi đọc cấu hình thì cho qua, không tự khoá site', async () => {
    const guard = new MaintenanceGuard({ getSettings: jest.fn().mockRejectedValue(new Error('redis down')) } as any);
    await expect(guard.canActivate(ctx('/api/courses').context)).resolves.toBe(true);
  });

  it('bỏ qua request không phải HTTP (websocket)', async () => {
    const guard = new MaintenanceGuard(settingsWith({}));
    await expect(guard.canActivate(ctx('/', undefined, 'ws').context)).resolves.toBe(true);
  });
});
