import { createZodDto } from "nestjs-zod";
import { CreateCategoryBodySchema, UpdateCategoryBodySchema, CategoryResponseSchema, GetListCategoriesResponseSchema, DeleteCategoryResponseSchema } from "./categories.model";

export class CreateCategoryBodyDto extends createZodDto(CreateCategoryBodySchema) {}
export class UpdateCategoryBodyDto extends createZodDto(UpdateCategoryBodySchema) {}
export class CategoryResponseDto extends createZodDto(CategoryResponseSchema) {}
export class GetListCategoriesResponseDto extends createZodDto(GetListCategoriesResponseSchema) {}
export class DeleteCategoryResponseDto extends createZodDto(DeleteCategoryResponseSchema) {}