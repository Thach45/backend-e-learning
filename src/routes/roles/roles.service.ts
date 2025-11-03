import { Injectable, NotFoundException } from '@nestjs/common';
import { RolesRepo } from './roles.repo';

@Injectable()
export class RolesService {
    constructor(private readonly repo: RolesRepo) {}

    async listRoles() {
        return this.repo.listRoles();
    }

    async getRole(id: string) {
        const role = await this.repo.getRoleById(id);
        if (!role) throw new NotFoundException('Role not found');
        return role;
    }

    async createRole(body: { name: any; description?: string; isActive?: boolean }) {
        return this.repo.createRole(body);
    }

    async updateRole(id: string, body: { name?: any; description?: string; isActive?: boolean }) {
        await this.getRole(id);
        return this.repo.updateRole(id, body);
    }

    async deleteRole(id: string) {
        await this.getRole(id);
        return this.repo.deleteRole(id);
    }

    async assignPermissions(id: string, permissionIds: string[]) {
        await this.getRole(id);
        return this.repo.assignPermissions(id, permissionIds);
    }

    async unassignPermissions(id: string, permissionIds: string[]) {
        await this.getRole(id);
        return this.repo.unassignPermissions(id, permissionIds);
    }
}

