/**
 * Đồng bộ bảng Permission + RolePermission dựa trên các route đã đăng ký trong NestJS.
 *
 * `npm run db:seed` trỏ tới file này nhưng trước đây không tồn tại trong repo, khiến
 * PermissionGuard luôn từ chối mọi request của user không phải ADMIN (ADMIN được bypass
 * trực tiếp trong guard, các role khác bắt buộc phải có bản ghi Permission tương ứng).
 *
 * Script này tự dò toàn bộ route đã đăng ký (thay vì liệt kê tay, dễ sót khi thêm route
 * mới) rồi upsert Permission + gán RolePermission theo quy ước:
 *   - path có segment "admin"      -> chỉ ADMIN (ADMIN vốn đã bypass PermissionGuard)
 *   - path có segment "instructor" -> ADMIN + INSTRUCTOR
 *   - còn lại                      -> ADMIN + INSTRUCTOR + CLIENT (mọi user đã đăng nhập)
 *
 * Idempotent: chạy lại nhiều lần an toàn, không tạo trùng bản ghi.
 * Yêu cầu: DATABASE_URL (và các biến env khác mà AppModule cần) đã được cấu hình.
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PrismaClient, ROLES } from '@prisma/client';
import { AppModule } from '../src/app.module';

interface DiscoveredRoute {
  path: string;
  method: string;
}

function normalizePath(path: string): string {
  return path.replace(/\/$/, '').replace(/^\/?/, '/');
}

function extractRoutes(app: NestExpressApplication): DiscoveredRoute[] {
  const instance = app.getHttpAdapter().getInstance();
  const router = (instance as any)._router ?? (instance as any).router;
  const stack: any[] = router?.stack ?? [];

  const routes: DiscoveredRoute[] = [];

  const visit = (layer: any) => {
    if (layer.route) {
      const path: string = layer.route.path;
      const methods: Record<string, boolean> = layer.route.methods;
      Object.keys(methods)
        .filter((m) => methods[m] && m !== 'head' && m !== 'options')
        .forEach((method) => {
          routes.push({ path: normalizePath(path), method: method.toUpperCase() });
        });
    } else if (layer.handle?.stack) {
      layer.handle.stack.forEach(visit);
    }
  };

  stack.forEach(visit);
  return routes;
}

function resolveTargetRoles(path: string): ROLES[] {
  const segments = path.split('/').filter(Boolean);
  if (segments.includes('admin')) return [ROLES.ADMIN];
  if (segments.includes('instructor')) return [ROLES.ADMIN, ROLES.INSTRUCTOR];
  return [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.CLIENT];
}

async function main() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn'],
  });
  await app.init();

  const rawRoutes = extractRoutes(app);
  // Không `await app.close()`: nó treo (gateway/Redis) khiến script không bao giờ kết thúc; process.exit ở cuối đã dọn tất cả.

  const uniqueRoutes = Array.from(
    new Map(rawRoutes.map((r) => [`${r.method} ${r.path}`, r])).values(),
  );

  if (uniqueRoutes.length === 0) {
    throw new Error('Không dò được route nào — kiểm tra lại cấu trúc Express adapter.');
  }

  const prisma = new PrismaClient();

  try {
    const roles = await Promise.all(
      Object.values(ROLES).map((name) =>
        prisma.role.upsert({
          where: { name },
          update: {},
          create: { name },
        }),
      ),
    );
    const roleByName = new Map(roles.map((r) => [r.name, r]));

    let permissionCount = 0;
    let linkCount = 0;

    for (const route of uniqueRoutes) {
      const permission = await prisma.permission.upsert({
        where: { path_method: { path: route.path, method: route.method } },
        update: {},
        create: {
          name: `${route.method} ${route.path}`,
          path: route.path,
          method: route.method,
        },
      });
      permissionCount += 1;

      for (const roleName of resolveTargetRoles(route.path)) {
        const role = roleByName.get(roleName);
        if (!role) continue;

        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: { roleId: role.id, permissionId: permission.id },
        });
        linkCount += 1;
      }
    }

    console.log(
      `Đã đồng bộ ${permissionCount} permission (từ ${uniqueRoutes.length} route) và ${linkCount} liên kết role-permission.`,
    );
    console.log(
      'Lưu ý: đây là gán quyền mặc định theo quy ước path (admin/instructor/còn lại). ' +
        'Hãy rà soát lại RolePermission cho các route cần siết chặt hơn quy ước chung.',
    );
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Seed permission thất bại:', err);
  process.exit(1);
});
