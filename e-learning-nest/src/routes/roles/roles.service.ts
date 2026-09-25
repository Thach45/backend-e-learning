import { Injectable, NotFoundException } from '@nestjs/common';
import { RolesRepo } from './roles.repo';
import { RedisService } from '../../shared/service/redis.service';

@Injectable()
export class RolesService {
    constructor(
        private readonly repo: RolesRepo,
        private readonly redis: RedisService,
    ) {}

    async listRoles() {
        const result = await this.repo.listRoles();
        // Transform rolePermissions from [{ permission: {...} }] to permissions: [...]
        if (result.data) {
            result.data = result.data.map((role: any) => ({
                ...role,
                permissions: role.rolePermissions?.map((rp: any) => rp.permission).filter(Boolean) || [],
            }));
        }
        return result;
    }

    async getRole(id: string) {
        const role = await this.repo.getRoleById(id);
        if (!role) throw new NotFoundException('Role not found');
        // Transform rolePermissions from [{ permission: {...} }] to permissions: [...]
        return {
            ...role,
            permissions: role.rolePermissions?.map((rp: any) => rp.permission).filter(Boolean) || [],
        };
    }

    async createRole(body: { name: any; description?: string; isActive?: boolean }) {
        const result = await this.repo.createRole(body);
        await this.redis.delByPattern('perm:allow:*');
        return result;
    }

    async updateRole(id: string, body: { name?: any; description?: string; isActive?: boolean }) {
        await this.getRole(id);
        const result = await this.repo.updateRole(id, body);
        await this.redis.delByPattern('perm:allow:*');
        return result;
    }

    async deleteRole(id: string) {
        await this.getRole(id);
        const result = await this.repo.deleteRole(id);
        await this.redis.delByPattern('perm:allow:*');
        return result;
    }

    async assignPermissions(id: string, permissionIds: string[]) {
        await this.getRole(id);
        const result = await this.repo.assignPermissions(id, permissionIds);
        await this.redis.delByPattern('perm:allow:*');
        return result;
    }

    async unassignPermissions(id: string, permissionIds: string[]) {
        await this.getRole(id);
        const result = await this.repo.unassignPermissions(id, permissionIds);
        await this.redis.delByPattern('perm:allow:*');
        return result;
    }
}

