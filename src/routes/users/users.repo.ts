import { Injectable, BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/shared/service/prisma.service";
import { CreateUserBody, GetUsersQuery, UpdateUserBody } from "./users.model";

const userSafeSelect = {
  id: true,
  email: true,
  name: true,
  phoneNumber: true,
  avatar: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  userRoles: {
    select: {
      role: {
        select: { name: true },
      },
    },
  },
} as const;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(query: GetUsersQuery) {
    const { page, limit, search } = query;
    if (page < 1 || limit < 1) {
      throw new BadRequestException("Page and limit must be positive numbers");
    }

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { phoneNumber: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        select: userSafeSelect,
      }),
      this.prisma.user.count({ where }),
    ]);

    const data = rows.map(r => ({
      id: r.id,
      email: r.email,
      name: r.name,
      phoneNumber: r.phoneNumber,
      avatar: r.avatar ?? null,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      roles: (r.userRoles ?? []).map(ur => ur.role.name),
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: userSafeSelect,
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar ?? null,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: (user.userRoles ?? []).map(ur => ur.role.name),
    };
  }

  async createUser(data: CreateUserBody & { password: string; createdBy?: string }) {
    // unique email check
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing && !existing.deletedAt) {
      throw new ConflictException(`Email ${data.email} already exists`);
    }

    const created = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        phoneNumber: data.phoneNumber,
        avatar: data.avatar,
        createdById: data.createdBy,
        updatedById: data.createdBy,
      },
      select: userSafeSelect,
    });
    return {
      id: created.id,
      email: created.email,
      name: created.name,
      phoneNumber: created.phoneNumber,
      avatar: created.avatar ?? null,
      status: created.status,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      roles: (created.userRoles ?? []).map(ur => ur.role.name),
    };
  }

  async updateUser(id: string, data: UpdateUserBody & { password?: string; updatedBy?: string; roles?: string[] }) {
    const existing = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (data.email && data.email !== existing.email) {
      const emailUsed = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (emailUsed && emailUsed.id !== id && !emailUsed.deletedAt) {
        throw new ConflictException(`Email ${data.email} already exists`);
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        email: data.email ?? existing.email,
        password: data.password ?? existing.password,
        name: data.name ?? existing.name,
        phoneNumber: data.phoneNumber ?? existing.phoneNumber,
        avatar: data.avatar ?? existing.avatar ?? undefined,
        status: data.status ?? existing.status,
        updatedById: data.updatedBy,
      },
      select: userSafeSelect,
    });

    // Update roles if provided (supports clearing with empty array)
    if (data.roles !== undefined) {
      const tx = this.prisma.$transaction.bind(this.prisma);
      await tx(async (prisma) => {
        // Fetch role ids by provided names
        const roleRecords = await prisma.role.findMany({
          where: { name: { in: data.roles as any } },
          select: { id: true },
        });
        const roleIds = roleRecords.map(r => r.id);

        // Remove links not in new set
        await prisma.userRole.deleteMany({
          where: {
            userId: id,
            ...(roleIds.length > 0 ? { roleId: { notIn: roleIds } } : {}),
          },
        });

        // Add missing links (skip if empty)
        if (roleIds.length > 0) {
          const existingLinks = await prisma.userRole.findMany({
            where: { userId: id, roleId: { in: roleIds } },
            select: { roleId: true },
          });
          const existingSet = new Set(existingLinks.map(l => l.roleId));
          const toCreate = roleIds.filter(rid => !existingSet.has(rid));
          if (toCreate.length > 0) {
            await prisma.userRole.createMany({
              data: toCreate.map(roleId => ({ userId: id, roleId })),
              skipDuplicates: true,
            });
          }
        }
      });

      // reselect updated with roles
      const withRoles = await this.prisma.user.findFirst({
        where: { id },
        select: userSafeSelect,
      });
      return {
        id: withRoles!.id,
        email: withRoles!.email,
        name: withRoles!.name,
        phoneNumber: withRoles!.phoneNumber,
        avatar: withRoles!.avatar ?? null,
        status: withRoles!.status,
        createdAt: withRoles!.createdAt,
        updatedAt: withRoles!.updatedAt,
        roles: (withRoles!.userRoles ?? []).map(ur => ur.role.name),
      };
    }
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phoneNumber: updated.phoneNumber,
      avatar: updated.avatar ?? null,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      roles: (updated.userRoles ?? []).map(ur => ur.role.name),
    };
  }

  async updateUserStatus(id: string, status: "ACTIVE"|"INACTIVE"|"BLOCKED", actor?: { userId: string }) {
    const existing = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const updated = await this.prisma.user.update({
      where: { id },
      data: { status, updatedById: actor?.userId },
      select: userSafeSelect,
    });
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phoneNumber: updated.phoneNumber,
      avatar: updated.avatar ?? null,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      roles: (updated.userRoles ?? []).map(ur => ur.role.name),
    };
  }

  async deleteUser(id: string) {
    const existing = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const deleted = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: userSafeSelect,
    });
    return {
      id: deleted.id,
      email: deleted.email,
      name: deleted.name,
      phoneNumber: deleted.phoneNumber,
      avatar: deleted.avatar ?? null,
      status: deleted.status,
      createdAt: deleted.createdAt,
      updatedAt: deleted.updatedAt,
      roles: (deleted.userRoles ?? []).map(ur => ur.role.name),
    };
  }
}


