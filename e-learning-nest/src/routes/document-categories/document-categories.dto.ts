import { createZodDto } from 'nestjs-zod';
import {
  GetDocumentCategoriesQuerySchema,
  GetDocumentCategoryParamsSchema,
  CreateDocumentCategoryBodySchema,
  UpdateDocumentCategoryBodySchema,
  GetDocumentCategoriesResponseSchema,
  GetDocumentCategoryResponseSchema,
} from './document-categories.model';

// Query DTOs
export class GetDocumentCategoriesQueryDto extends createZodDto(GetDocumentCategoriesQuerySchema) {}
export class GetDocumentCategoryParamsDto extends createZodDto(GetDocumentCategoryParamsSchema) {}

// Body DTOs
export class CreateDocumentCategoryBodyDto extends createZodDto(CreateDocumentCategoryBodySchema) {}
export class UpdateDocumentCategoryBodyDto extends createZodDto(UpdateDocumentCategoryBodySchema) {}

// Response DTOs
export class GetDocumentCategoriesResponseDto extends createZodDto(GetDocumentCategoriesResponseSchema) {}
export class GetDocumentCategoryResponseDto extends createZodDto(GetDocumentCategoryResponseSchema) {}

