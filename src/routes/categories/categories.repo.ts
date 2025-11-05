import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { CreateCategoryBody, UpdateCategoryBody } from "./categories.model";

@Injectable()
export class CategoriesRepository {
    constructor(private readonly prisma: PrismaService) {}
    async createCategory(category: CreateCategoryBody, user: any) {
        return this.prisma.category.create({
            data: {
                ...category,
                createdBy: user.userId,
            },
        });
    }
    async findAllCategories() {
        return this.prisma.category.findMany();
    }
    async findCategoryById(id: string) {
        return this.prisma.category.findUnique({
            where: { id },
        });
    }
    async updateCategory(id: string, category: UpdateCategoryBody, user: any) {
        return this.prisma.category.update({
            where: { id },
            data: {
                ...category,
                updatedBy: user.userId,
            },
        });
    }
}