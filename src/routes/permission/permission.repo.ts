import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { CreatePermissionType, GetPermissionQueryType, UpdatePermissionType } from "./permission.model";
import { Prisma } from "@prisma/client";

@Injectable()
export class PermissionRepo {
    constructor(private readonly prisma: PrismaService) {}

    async getListPermissions(query: GetPermissionQueryType) {
        try {
            const { page, limit } = query;
            if (page < 1 || limit < 1) {
                throw new BadRequestException('Page and limit must be positive numbers');
            }

            const [permissions, total] = await Promise.all([
                this.prisma.permission.findMany({
                    where: {
                        deletedAt: null,
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                this.prisma.permission.count({
                    where: {
                        deletedAt: null,
                    },
                }),
            ]);

            return { permissions, total, page, limit, totalPages: Math.ceil(total / limit) };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to fetch permissions list');
        }
    }

    async getPermissionById(id: string) {
        try {
            const permission = await this.prisma.permission.findUnique({
                where: {
                    id,
                    deletedAt: null,
                },
            });

            if (!permission) {
                throw new NotFoundException(`Permission with ID ${id} not found`);
            }

            return permission;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`Failed to fetch permission with ID ${id}`);
        }
    }

    async createPermission(body: CreatePermissionType, user: any) {
        try {
            // Check for existing permission with same path and method
            const existingPermission = await this.prisma.permission.findFirst({
                where: {
                    path: body.path,
                    method: body.method,
                    deletedAt: null,
                },
            });

            if (existingPermission) {
                throw new ConflictException(`Permission with path ${body.path} and method ${body.method} already exists`);
            }

            return await this.prisma.permission.create({
                data: {
                    name: body.name,
                    path: body.path,
                    method: body.method,
                    createdBy: user.userId,
                    updatedBy: user.userId,
                    description: body.description || 'No description',
                },
            });
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw new BadRequestException('Invalid permission data provided');
            }
            throw new BadRequestException('Failed to create permission');
        }
    }

    async updatePermission(id: string, body: UpdatePermissionType, user: any) {
        try {
            // Check if permission exists
            const existingPermission = await this.getPermissionById(id);

            if (!existingPermission) {
                throw new NotFoundException(`Permission with ID ${id} not found`);
            }

            // Check for duplicate path and method if they are being updated
            if (body.path || body.method) {
                const duplicatePermission = await this.prisma.permission.findFirst({
                    where: {
                        id: { not: id },
                        path: body.path || existingPermission.path,
                        method: body.method || existingPermission.method,
                        deletedAt: null,
                    },
                });

                if (duplicatePermission) {
                    throw new ConflictException(`Permission with path ${body.path} and method ${body.method} already exists`);
                }
            }

            return await this.prisma.permission.update({
                where: { id },
                data: {
                    ...body,
                    updatedBy: user.userId,
                },
            });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw new BadRequestException('Invalid permission data provided');
            }
            throw new BadRequestException(`Failed to update permission with ID ${id}`);
        }
    }

    async deletePermission(id: string) {
        try {
            // Check if permission exists
            const existingPermission = await this.getPermissionById(id);

            if (!existingPermission) {
                throw new NotFoundException(`Permission with ID ${id} not found`);
            }

            return await this.prisma.permission.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`Failed to delete permission with ID ${id}`);
        }
    }
}
