import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { CreateCategoryBodyDto, UpdateCategoryBodyDto, CategoryResponseDto, GetListCategoriesResponseDto } from './categories.dto';
import { CategoriesService } from './categories.service';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';
import { Public } from 'src/shared/decorator/auth.decorator';

@Controller('api')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}
    @Get("categories")
    // @ZodSerializerDto(GetListCategoriesResponseDto)
    @Public()
    async getAllCategories() { 
        return this.categoriesService.getAllCategories()
    }
    @Get("admin/categories")
    // @ZodSerializerDto(GetListCategoriesResponseDto)
    @Public()
    async getAllAdminCategories() { 
        return this.categoriesService.getAllCategories()
    }
    @Get("/admin/categories/:id")
    @ZodSerializerDto(CategoryResponseDto)
    async getCategoryById(@Param("id") id: string) {
        return this.categoriesService.getCategoryById(id);
    }
    @Post("/admin/categories")
    @ZodSerializerDto(CategoryResponseDto)
    async createCategory(@Body() body: CreateCategoryBodyDto, @ActiveUser() user: any) {
        return this.categoriesService.createCategory(body, user);
    }
    @Put("/admin/categories/:id")
    @ZodSerializerDto(CategoryResponseDto)
    async updateCategory(@Param("id") id: string, @Body() body: UpdateCategoryBodyDto, @ActiveUser() user: any) {
        return this.categoriesService.updateCategory(id, body, user);
    }
}
