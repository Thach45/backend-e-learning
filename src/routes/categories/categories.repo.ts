import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { CreateCategoryBody } from "./categories.model";

@Injectable()
export class CategoriesRepository {
    constructor(private readonly prisma: PrismaService) {}
    async createCategory(category: CreateCategoryBody) {
        return this.prisma.category.create({
            data: category,
        });
    }
}