import { createZodDto } from 'nestjs-zod';
import {
  GetDocumentTagsQuerySchema,
  GetDocumentTagParamsSchema,
  CreateDocumentTagBodySchema,
  UpdateDocumentTagBodySchema,
  GetDocumentTagsResponseSchema,
  GetDocumentTagResponseSchema,
  GetTrendingTagsResponseSchema,
} from './document-tags.model';

export class GetDocumentTagsQueryDto extends createZodDto(GetDocumentTagsQuerySchema) {}
export class GetDocumentTagParamsDto extends createZodDto(GetDocumentTagParamsSchema) {}
export class CreateDocumentTagBodyDto extends createZodDto(CreateDocumentTagBodySchema) {}
export class UpdateDocumentTagBodyDto extends createZodDto(UpdateDocumentTagBodySchema) {}

export class GetDocumentTagsResponseDto extends createZodDto(GetDocumentTagsResponseSchema) {}
export class GetDocumentTagResponseDto extends createZodDto(GetDocumentTagResponseSchema) {}
export class GetTrendingTagsResponseDto extends createZodDto(GetTrendingTagsResponseSchema) {}

