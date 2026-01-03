import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { DocumentCategoriesService } from './document-categories.service';
import { Public } from 'src/shared/decorator/auth.decorator';
import {
  GetDocumentCategoriesQueryDto,
  GetDocumentCategoryParamsDto,
  CreateDocumentCategoryBodyDto,
  UpdateDocumentCategoryBodyDto,
  GetDocumentCategoriesResponseDto,
  GetDocumentCategoryResponseDto,
} from './document-categories.dto';

@Controller('api')
export class DocumentCategoriesController {
  constructor(private readonly service: DocumentCategoriesService) {}

  // Public endpoints
  @Get('document-categories')
  @Public()
  @ZodSerializerDto(GetDocumentCategoriesResponseDto)
  async getCategories(@Query() query: GetDocumentCategoriesQueryDto) {
    return this.service.getCategories(query as any);
  }

  @Get('document-categories/:id')
  @Public()
  @ZodSerializerDto(GetDocumentCategoryResponseDto)
  async getCategoryById(@Param() params: GetDocumentCategoryParamsDto) {
    return this.service.getCategoryById((params as any).id);
  }

  // Admin endpoints
  @Post('admin/document-categories')
  @ZodSerializerDto(GetDocumentCategoryResponseDto)
  async createCategory(@Body() body: CreateDocumentCategoryBodyDto) {
    return this.service.createCategory(body as any);
  }

  @Put('admin/document-categories/:id')
  @ZodSerializerDto(GetDocumentCategoryResponseDto)
  async updateCategory(
    @Param() params: GetDocumentCategoryParamsDto,
    @Body() body: UpdateDocumentCategoryBodyDto,
  ) {
    return this.service.updateCategory((params as any).id, body as any);
  }

  @Delete('admin/document-categories/:id')
  async deleteCategory(@Param() params: GetDocumentCategoryParamsDto) {
    return this.service.deleteCategory((params as any).id);
  }
}

