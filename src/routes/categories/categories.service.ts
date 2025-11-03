import { Injectable } from '@nestjs/common';
import { CreateCategoryBodyDto } from './categories.dto';
import { CategoriesRepository } from './categories.repo';

@Injectable()
export class CategoriesService {
    constructor(private readonly categoriesRepository: CategoriesRepository) {}
    async getCategories() {
        return 'Categories';
    }
    async createCategory(body: CreateCategoryBodyDto) {
        const category = await this.categoriesRepository.createCategory(body);
        return category;
    }
}
