import { PrismaClient, ROLES } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const roles = [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.CLIENT];
  const roleMap: Record<string, { id: string; name: string }> = {};

  for (const name of roles) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    roleMap[name] = role;
  }

  const permissionsSeed = [
    { name: 'View permissions', path: '/permission', method: 'GET', description: 'List permissions' },
    { name: 'Create permission', path: '/permission', method: 'POST', description: 'Create permission' },
    { name: 'Update permission', path: '/permission/:id', method: 'PUT', description: 'Update permission' },
    { name: 'Delete permission', path: '/permission/:id', method: 'DELETE', description: 'Soft delete permission' },
  ];

  const permissions = [] as { id: string }[];
  for (const p of permissionsSeed) {
    const perm = await prisma.permission.upsert({
      where: { path_method: { path: p.path, method: p.method } },
      update: { name: p.name, description: p.description ?? null },
      create: { name: p.name, description: p.description ?? null, path: p.path, method: p.method },
    });
    permissions.push({ id: perm.id });
  }

  // Grant all permissions to ADMIN
  for (const perm of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roleMap.ADMIN.id, permissionId: perm.id } },
      update: {},
      create: { roleId: roleMap.ADMIN.id, permissionId: perm.id },
    });
  }

  // Production: không được dùng mật khẩu mặc định đã công khai trong mã nguồn
  if (process.env.NODE_ENV === 'production' && (!process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD)) {
    throw new Error('Production: hãy đặt SEED_ADMIN_EMAIL và SEED_ADMIN_PASSWORD trong .env trước khi chạy seed.');
  }
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
  const hashed = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashed,
      name: 'Admin',
      phoneNumber: '0000000000',
      status: 'ACTIVE',
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: roleMap.ADMIN.id } },
    update: {},
    create: { userId: admin.id, roleId: roleMap.ADMIN.id },
  });

  console.log('Seed completed. Admin:', adminEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


