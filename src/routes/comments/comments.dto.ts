import { createZodDto } from "nestjs-zod";
import {
  CreateCommentBodySchema,
  UpdateCommentBodySchema,
  GetCommentsQuerySchema,
  GetCommentsParamsSchema,
  GetCommentByIdParamsSchema,
  GetCommentResponseSchema,
  GetCommentsResponseSchema,
} from "./comments.model";

export class CreateCommentBodyDto extends createZodDto(CreateCommentBodySchema) {}
export class UpdateCommentBodyDto extends createZodDto(UpdateCommentBodySchema) {}
export class GetCommentsQueryDto extends createZodDto(GetCommentsQuerySchema) {}
export class GetCommentsParamsDto extends createZodDto(GetCommentsParamsSchema) {}
export class GetCommentByIdParamsDto extends createZodDto(GetCommentByIdParamsSchema) {}
export class GetCommentResponseDto extends createZodDto(GetCommentResponseSchema) {}
export class GetCommentsResponseDto extends createZodDto(GetCommentsResponseSchema) {}

