import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repo';
import { CreateUserBody, GetUsersQuery, UpdateUserBody, UpdateUserStatusBody } from './users.model';
import { HashingService } from 'src/shared/service/hashing.service';
import { RedisService } from 'src/shared/service/redis.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly hashingService: HashingService,
    private readonly redis: RedisService,
  ) {}

  async getUsers(query: GetUsersQuery) {
    return this.usersRepo.getUsers(query);
  }

  async getUserById(id: string) {
    return this.usersRepo.getUserById(id);
  }

  async createUser(body: CreateUserBody, actor?: { userId: string }) {
    const hashed = await this.hashingService.hashPassword(body.password);
    return this.usersRepo.createUser({
      ...body,
      password: hashed,
      createdBy: actor?.userId,
    });
  }

  async updateUser(id: string, body: UpdateUserBody, actor?: { userId: string }) {
    const next: UpdateUserBody & { password?: string; updatedBy?: string } = {
      ...body,
      updatedBy: actor?.userId,
    };
    if (body.password) {
      next.password = await this.hashingService.hashPassword(body.password);
    }
    const result = await this.usersRepo.updateUser(id, next);
    // User roles/status có thể thay đổi -> xóa cache permission cho user này
    await this.redis.delByPattern(`perm:allow:${id}:*`);
    return result;
  }

  async deleteUser(id: string) {
    const result = await this.usersRepo.deleteUser(id);
    await this.redis.delByPattern(`perm:allow:${id}:*`);
    return result;
  }

  async updateUserStatus(id: string, body: UpdateUserStatusBody, actor?: { userId: string }) {
    const result = await this.usersRepo.updateUserStatus(id, body.status, actor);
    await this.redis.delByPattern(`perm:allow:${id}:*`);
    return result;
  }
}
