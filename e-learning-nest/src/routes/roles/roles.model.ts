import z from "zod";
import { GetPermissionResponseSchema, PermissionSchema } from "../permission/permission.model";


// Schema for RolePermission relation (from Prisma include)
export const RolePermissionSchema = z.object({
    id: z.string().uuid(),
    roleId: z.string().uuid(),
    permissionId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
    permission: PermissionSchema, // Nested permission from Prisma include
});

export const RoleSchema = z.object({
    id: z.string().uuid(),
    name: z.enum(["ADMIN", "CLIENT", "INSTRUCTOR"]),
    description: z.string().nullable().optional(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable().optional(),
    createdById: z.string().nullable().optional(),
    updatedById: z.string().nullable().optional(),
    rolePermissions: z.array(RolePermissionSchema).optional(), // From Prisma include (raw)
    permissions: z.array(PermissionSchema).optional(), // Transformed flat array for frontend
});

export const CreateRoleBodySchema = z.object({
    name: z.enum(["ADMIN", "CLIENT", "INSTRUCTOR"]),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
});

export const UpdateRoleBodySchema = z.object({
    name: z.enum(["ADMIN", "CLIENT", "INSTRUCTOR"]).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
});

export const AssignPermissionsBodySchema = z.object({
    permissionIds: z.array(z.string().uuid()).min(1),
});

export const UnassignPermissionsBodySchema = AssignPermissionsBodySchema;

export const RoleResponseSchema = RoleSchema;
export const GetListRolesResponseSchema = z.object({
    data: z.array(RoleResponseSchema),
    total: z.number()
});
export const AssignPermissionsResponseSchema = z.object({
    success: z.boolean(),
});

export type Role = z.infer<typeof RoleSchema>;

