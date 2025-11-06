import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repo';
import { CreateUserBody, GetUsersQuery, UpdateUserBody, UpdateUserStatusBody } from './users.model';
import { HashingService } from 'src/shared/service/hashing.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly hashingService: HashingService,
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
    return this.usersRepo.updateUser(id, next);
  }

  async deleteUser(id: string) {
    return this.usersRepo.deleteUser(id);
  }

  async updateUserStatus(id: string, body: UpdateUserStatusBody, actor?: { userId: string }) {
    return this.usersRepo.updateUserStatus(id, body.status, actor);
  }
}
