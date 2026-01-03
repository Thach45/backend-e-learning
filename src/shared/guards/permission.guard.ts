import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../service/prisma.service';
import { ROLES } from '@prisma/client';
import { AuthType, Type } from '../types/auth.type';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
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

    // ADMIN bypass
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.userId },
      include: { role: true },
    });
    if (userRoles.some(r => r.role.name === ROLES.ADMIN)) return true;

    // Map path + method
    // NestJS: req.route?.path hoặc req.url (cần parse)
    // Ưu tiên req.route?.path vì nó là route pattern (có :id), không phải actual path
    let path = req.route?.path;
    
    // Fallback: nếu không có route.path, dùng req.url và normalize
    if (!path) {
      const url = req.url?.split('?')[0]; // Remove query params
      // Try to get from route pattern if available
      path = url;
    }
    
    const method = String(req.method).toUpperCase();
    
    if (!path) {
      console.warn(`[PermissionGuard] Cannot resolve path for ${method} ${req.url}`);
      throw new ForbiddenException('Route not resolvable');
    }

    // Normalize path: remove trailing slash, ensure starts with /
    path = path.replace(/\/$/, '').replace(/^\/?/, '/');

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
        permissionId: perm.id 
      },
    });
    
    if (!count) {
      throw new ForbiddenException('Permission denied');
    }
    
    return true;
  }
}