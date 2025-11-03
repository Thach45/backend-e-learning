import { Injectable } from '@nestjs/common';
import { CreatePermissionType, GetPermissionQueryType, UpdatePermissionType } from './permission.model';
import { PermissionRepo } from './permission.repo';

@Injectable()
export class PermissionService {
    constructor(private readonly permissionRepo: PermissionRepo) {}
    async getListPermissions(query: GetPermissionQueryType) {
        return this.permissionRepo.getListPermissions(query)
    }
    async getPermissionById(id: string) {
        return this.permissionRepo.getPermissionById(id)
    }
    async createPermission(body: CreatePermissionType, user: any) {
        return this.permissionRepo.createPermission(body, user)
    }
    async updatePermission(id: string, body: UpdatePermissionType, user: any) {
        return this.permissionRepo.updatePermission(id, body, user)
    }
    async deletePermission(id: string) {
            return this.permissionRepo.deletePermission(id)
    }
}
