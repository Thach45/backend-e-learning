import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../service/prisma.service';
import { RedisService } from '../service/redis.service';
import { ROLES } from '@prisma/client';
import { AuthType, Type } from '../types/auth.type';

const PERM_CACHE_TTL = 300; // 5 phút

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    
    // Bypass nếu có @Public() hoặc metadata 'auth' được gắn
    const meta = this.reflector.getAllAndOverride<AuthType>('auth', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    
    // Chỉ bypass khi có PUBLIC
    const isPublic = meta?.Type?.includes(Type.PUBLIC) === true;
    if (isPublic) return true;
    
    if (!user) throw new ForbiddenException('Unauthenticated');

    // Map path + method (dùng cho cache key và logic DB)
    let path = req.route?.path ?? req.url?.split('?')[0] ?? '';
    const method = String(req.method).toUpperCase();
    if (!path) {
      console.warn(`[PermissionGuard] Cannot resolve path for ${method} ${req.url}`);
      throw new ForbiddenException('Route not resolvable');
    }
    path = path.replace(/\/$/, '').replace(/^\/?/, '/');

    const cacheKey = `perm:allow:${user.userId}:${method}:${path}`;
    const cached = await this.redis.get(cacheKey);
    if (cached === '1') return true;
    if (cached === '0') throw new ForbiddenException('Permission denied');

    
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.userId },
      include: { role: true },
    });
    if (userRoles.some(r => r.role.name === ROLES.ADMIN)) {
      await this.redis.set(cacheKey, '1', PERM_CACHE_TTL);
      return true;
    }

    const perm = await this.prisma.permission.findUnique({
      where: { path_method: { path, method } },
      select: { id: true },
    });

    // Chưa sync permission -> reject để đảm bảo bảo mật
    // Hoặc có thể log warning và cho qua trong development
    if (!perm) {
      console.warn(`[PermissionGuard] Permission not found: ${method} ${path}`);
      // Reject để đảm bảo bảo mật - chỉ cho qua khi đã sync đầy đủ permissions
      throw new ForbiddenException(`Permission not configured for ${method} ${path}`);
    }

    const count = await this.prisma.rolePermission.count({
      where: {
        roleId: { in: userRoles.map(r => r.roleId) },
        permissionId: perm.id,
      },
    });

    if (!count) {
      await this.redis.set(cacheKey, '0', PERM_CACHE_TTL);
      throw new ForbiddenException('Permission denied');
    }

    await this.redis.set(cacheKey, '1', PERM_CACHE_TTL);
    return true;
  }
}