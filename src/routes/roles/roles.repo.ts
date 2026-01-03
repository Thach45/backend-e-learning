import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/service/prisma.service';

@Injectable()
export class RolesRepo {
    constructor(private readonly prisma: PrismaService) {}

    async listRoles() {
        const [roles, total] = await Promise.all([
            this.prisma.role.findMany({ where: { deletedAt: null }, include: { rolePermissions: { include: { permission: true } } } }),
            this.prisma.role.count({ where: { deletedAt: null } }),
        ]);
        console.log(roles);
        return { data: roles, total };
    }

    async getRoleById(id: string) {
        return this.prisma.role.findUnique({ 
            where: { id },
            include: { 
                rolePermissions: { 
                    include: { 
                        permission: true 
                    } 
                } 
            } 
        });
    }

    async createRole(data: { name: any; description?: string; isActive?: boolean }) {
        return this.prisma.role.create({ data: { ...data } });
    }

    async updateRole(id: string, data: { name?: any; description?: string; isActive?: boolean }) {
        return this.prisma.role.update({ where: { id }, data });
    }

    async deleteRole(id: string) {
        await this.prisma.role.delete({ where: { id } });
        return { success: true };
    }

    async assignPermissions(roleId: string, permissionIds: string[]) {
        const data = permissionIds.map((permissionId) => ({ roleId, permissionId }));
        await this.prisma.rolePermission.createMany({ data, skipDuplicates: true });
        return { success: true };
    }

    async unassignPermissions(roleId: string, permissionIds: string[]) {
        await this.prisma.rolePermission.deleteMany({ where: { roleId, permissionId: { in: permissionIds } } });
        return { success: true };
    }
}

