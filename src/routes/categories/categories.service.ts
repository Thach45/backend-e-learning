import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryBodyDto, UpdateCategoryBodyDto } from './categories.dto';
import { CategoriesRepository } from './categories.repo';

@Injectable()
export class CategoriesService {
    constructor(private readonly categoriesRepository: CategoriesRepository) {}
    async getAllCategories() {
        return this.categoriesRepository.findAllCategories();
    }
    async createCategory(body: CreateCategoryBodyDto, user: any) {
        const category = await this.categoriesRepository.createCategory(body, user);
        return category;
    }
    async getCategoryById(id: string) {
        const category = await this.categoriesRepository.findCategoryById(id);
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }
    async updateCategory(id: string, body: UpdateCategoryBodyDto, user: any) {
        const existingCategory = await this.categoriesRepository.findCategoryById(id);
        if (!existingCategory) {
            throw new NotFoundException('Category not found');
        }
        return this.categoriesRepository.updateCategory(id, body, user);
    }
}
