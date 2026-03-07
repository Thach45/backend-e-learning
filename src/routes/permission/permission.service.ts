import { Injectable } from '@nestjs/common';
import { CreatePermissionType, GetPermissionQueryType, UpdatePermissionType } from './permission.model';
import { PermissionRepo } from './permission.repo';
import { RedisService } from '../../shared/service/redis.service';

@Injectable()
export class PermissionService {
    constructor(
        private readonly permissionRepo: PermissionRepo,
        private readonly redis: RedisService,
    ) {}
    async getListPermissions(query: GetPermissionQueryType) {
        return this.permissionRepo.getListPermissions(query)
    }
    async getPermissionById(id: string) {
        return this.permissionRepo.getPermissionById(id)
    }
    async createPermission(body: CreatePermissionType, user: any) {
        const result = await this.permissionRepo.createPermission(body, user);
        await this.redis.delByPattern('perm:allow:*');
        return result;
    }
    async updatePermission(id: string, body: UpdatePermissionType, user: any) {
        const result = await this.permissionRepo.updatePermission(id, body, user);
        await this.redis.delByPattern('perm:allow:*');
        return result;
    }
    async deletePermission(id: string) {
        const result = await this.permissionRepo.deletePermission(id);
        await this.redis.delByPattern('perm:allow:*');
        return result;
    }
}
