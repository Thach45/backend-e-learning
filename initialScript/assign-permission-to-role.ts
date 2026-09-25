import { PrismaClient, ROLES } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1) Ensure roles exist
  const roles: ROLES[] = [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.CLIENT];
  const roleMap: Record<ROLES, { id: string }> = {} as any;

  for (const name of roles) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    roleMap[name] = { id: role.id };
  }

  // 2) Load all permissions (active or not — adjust filter if needed)
  const permissions = await prisma.permission.findMany({
    select: { id: true, path: true, method: true },
  });

  const keyOf = (p: { path: string; method: string }) => `${p.path}:${p.method}`;
  const permissionByKey = new Map(permissions.map((p) => [keyOf(p), p]));

  // 3) Define mapping: which permissions each role gets
  // - '*' means all permissions
  // - otherwise, list specific keys as `${path}:${method}`
  const roleToPermissionKeys: Record<ROLES, string[] | ['*']> = {
    [ROLES.ADMIN]: ['*'], // Admin gets all permissions
    
    [ROLES.INSTRUCTOR]: [
      // Instructor courses management
      '/api/instructor/courses:GET',
      '/api/instructor/courses:POST',
      '/api/instructor/courses/:id:GET',
      '/api/instructor/courses/:id:PUT',
      '/api/instructor/courses/:id:DELETE',
      '/api/instructor/courses/:id/request-approval:POST',
      '/api/instructor/courses/:id/request-delete:POST',
      
      // Instructor reviews management
      '/api/instructor/courses/:courseId/reviews:GET',
      '/api/instructor/courses/:courseId/reviews/:reviewId:PUT',
      '/api/instructor/courses/:courseId/reviews/:reviewId:DELETE',
      
      // Instructor enrollments management
      '/api/instructor/courses/:courseId/enrollments:GET',
      '/api/instructor/courses/:courseId/enrollments:POST',
      '/api/instructor/students:GET',
      '/api/instructor/enrollments/:enrollmentId:DELETE',
      
      // Instructor lessons management
      '/api/instructor/courses/:courseId/contents/:contentId/lessons:GET',
      '/api/instructor/courses/:courseId/contents/:contentId/lessons:POST',
      '/api/instructor/courses/:courseId/contents/:contentId/lessons/:id:GET',
      '/api/instructor/courses/:courseId/contents/:contentId/lessons/:id:PUT',
      '/api/instructor/courses/:courseId/contents/:contentId/lessons/:id:DELETE',
      
      // Public courses viewing
      '/api/courses:GET',
      '/api/courses/:id:GET',
      '/api/categories:GET',
    ],
    
    [ROLES.CLIENT]: [
      // Courses viewing
      '/api/courses:GET',
      '/api/courses/:id:GET',
      '/api/categories:GET',
      
      // Reviews
      '/api/courses/:courseId/reviews:GET',
      '/api/courses/:courseId/reviews:POST',
      '/api/my-reviews/:courseId:GET',
      
      // Orders
      '/api/orders:POST',
      '/api/my-orders:GET',
      '/api/my-orders/:orderId:GET',
      '/api/orders/:orderId/qr-code:GET',
      '/api/orders/:orderId/check-payment:POST',
      
      // Enrollments
      '/api/courses/:courseId/enroll:POST',
      '/api/my-enrollments:GET',
      '/api/my-enrollments/stats:GET',
      '/api/my-enrollments/:courseId:GET',
      '/api/my-enrollments/:courseId:PUT',
      '/api/my-enrollments/:courseId/contents:GET',
      '/api/my-enrollments/:courseId/lessons/:lessonId:GET',
      
      // Cart
      '/api/cart:GET',
      '/api/cart:DELETE',
      '/api/cart/items:POST',
      '/api/cart/items/:courseId:DELETE',
      
      // Wishlist
      '/api/courses/:courseId/wishlist:GET',
      '/api/courses/:courseId/wishlist:POST',
      '/api/courses/:courseId/wishlist:DELETE',
      '/api/my-wishlist:GET',
      
      // Comments
      '/api/lessons/:lessonId/comments:GET',
      '/api/lessons/:lessonId/comments:POST',
      '/api/lessons/:lessonId/comments/:commentId:GET',
      '/api/lessons/:lessonId/comments/:commentId:PUT',
      '/api/lessons/:lessonId/comments/:commentId:DELETE',
    ],
  } as const;

  // 4) Build assignments and write to DB
  for (const roleName of roles) {
    const keys = roleToPermissionKeys[roleName];
    let targetPermissionIds: string[] = [];

    if (keys.length === 1 && keys[0] === '*') {
      targetPermissionIds = permissions.map((p) => p.id);
      console.log(`\n📋 ${roleName}: Assigning ALL ${permissions.length} permissions`);
    } else {
      const foundPermissions = keys
        .map((k) => {
          const perm = permissionByKey.get(k);
          if (!perm) {
            console.warn(`⚠️  Permission not found: ${k}`);
          }
          return perm;
        })
        .filter((p) => Boolean(p));
      
      targetPermissionIds = foundPermissions.map((p) => (p as { id: string }).id);
      
      console.log(`\n📋 ${roleName}: Found ${foundPermissions.length}/${keys.length} permissions`);
      if (foundPermissions.length < keys.length) {
        const missing = keys.filter((k) => !permissionByKey.has(k));
        console.warn(`   Missing permissions: ${missing.join(', ')}`);
      }
    }

    if (targetPermissionIds.length === 0) {
      console.log(`   ⚠️  No permissions to assign for ${roleName}`);
      continue;
    }

    const result = await prisma.rolePermission.createMany({
      data: targetPermissionIds.map((permissionId) => ({
        roleId: roleMap[roleName].id,
        permissionId,
      })),
      skipDuplicates: true,
    });

    console.log(`   ✅ Assigned ${result.count} permissions to ${roleName}`);
  }

  console.log('\n✅ Completed assigning permissions to roles.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


