import { createZodDto } from "nestjs-zod";
import { CreateCategoryBodySchema, UpdateCategoryBodySchema, CategoryResponseSchema, GetListCategoriesResponseSchema, DeleteCategoryResponseSchema, AdminCategoryResponseSchema, GetListAdminCategoriesResponseSchema } from "./categories.model";

export class CreateCategoryBodyDto extends createZodDto(CreateCategoryBodySchema) {}
export class UpdateCategoryBodyDto extends createZodDto(UpdateCategoryBodySchema) {}
export class CategoryResponseDto extends createZodDto(CategoryResponseSchema) {}
export class AdminCategoryResponseDto extends createZodDto(AdminCategoryResponseSchema) {}
export class GetListCategoriesResponseDto extends createZodDto(GetListCategoriesResponseSchema) {}
export class GetListAdminCategoriesResponseDto extends createZodDto(GetListAdminCategoriesResponseSchema) {}
export class DeleteCategoryResponseDto extends createZodDto(DeleteCategoryResponseSchema) {}