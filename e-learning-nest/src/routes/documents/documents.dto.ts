import { createZodDto } from 'nestjs-zod';
import {
  GetDocumentsQuerySchema,
  GetDocumentParamsSchema,
  CreateDocumentBodySchema,
  UpdateDocumentBodySchema,
  ToggleVerifyBodySchema,
  GetDocumentsResponseSchema,
  GetDocumentResponseSchema,
  GetTopContributorsResponseSchema,
  LikeResponseSchema,
  DownloadResponseSchema,
} from './documents.model';

// Query DTOs
export class GetDocumentsQueryDto extends createZodDto(GetDocumentsQuerySchema) {}
export class GetDocumentParamsDto extends createZodDto(GetDocumentParamsSchema) {}

// Body DTOs
export class CreateDocumentBodyDto extends createZodDto(CreateDocumentBodySchema) {}
export class UpdateDocumentBodyDto extends createZodDto(UpdateDocumentBodySchema) {}
export class ToggleVerifyBodyDto extends createZodDto(ToggleVerifyBodySchema) {}

// Response DTOs
export class GetDocumentsResponseDto extends createZodDto(GetDocumentsResponseSchema) {}
export class GetDocumentResponseDto extends createZodDto(GetDocumentResponseSchema) {}
export class GetTopContributorsResponseDto extends createZodDto(GetTopContributorsResponseSchema) {}
export class LikeResponseDto extends createZodDto(LikeResponseSchema) {}
export class DownloadResponseDto extends createZodDto(DownloadResponseSchema) {}

