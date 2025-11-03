import { Body, Controller, Get, Post } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { CreateCategoryBodyDto, CategoryResponseDto } from './categories.dto';
import { CategoriesService } from './categories.service';

@Controller('api/categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}
    @Get()
    // @ZodSerializerDto(GetListCategoriesResponseDto)
    async getCategories() {
        return 'Categories';
    }
    @Post()
    @ZodSerializerDto(CategoryResponseDto)
    async createCategory(@Body() body: CreateCategoryBodyDto) {
        return this.categoriesService.createCategory(body);
    }
}
