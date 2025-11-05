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
    const user = req.user
    // Bypass nếu có @Public() hoặc metadata 'auth' được gắn
    const meta = this.reflector.getAllAndOverride<AuthType>('auth', [
        ctx.getHandler(),
        ctx.getClass(),
      ]);
    
      // Chỉ bypass khi có PUBLIC
      const isPublic = meta?.Type?.includes(Type.PUBLIC) === true;
      console.log(isPublic);
      if (isPublic) return true;
    
    if (!user) throw new ForbiddenException('Unauthenticated');

    // ADMIN bypass
    console.log(user);
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.userId },
      include: { role: true },
    });
    if (userRoles.some(r => r.role.name === ROLES.ADMIN)) return true;

    // Map path + method
    const path = req.route?.path; // dạng '/api/roles/:id'
    const method = String(req.method).toUpperCase();
    console.log(path, method);
    if (!path) throw new ForbiddenException('Route not resolvable');

    const perm = await this.prisma.permission.findUnique({
      where: { path_method: { path, method } },
      select: { id: true },
    });

    // Chưa sync permission -> cho qua (tuỳ chính sách bạn có thể đổi thành reject)
    if (!perm) return true;

    const count = await this.prisma.rolePermission.count({
      where: { roleId: { in: userRoles.map(r => r.roleId) }, permissionId: perm.id },
    });
    if (!count) throw new ForbiddenException('Permission denied');
    return true;
  }
}