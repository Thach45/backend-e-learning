import { createZodDto } from "nestjs-zod";
import {
  CreateReviewBodySchema,
  UpdateReviewBodySchema,
  GetReviewsQuerySchema,
  GetReviewParamsSchema,
  GetReviewByIdParamsSchema,
  GetReviewResponseSchema,
  GetReviewsResponseSchema,
} from "./reviews.model";

export class CreateReviewBodyDto extends createZodDto(CreateReviewBodySchema) {}
export class UpdateReviewBodyDto extends createZodDto(UpdateReviewBodySchema) {}
export class GetReviewsQueryDto extends createZodDto(GetReviewsQuerySchema) {}
export class GetReviewParamsDto extends createZodDto(GetReviewParamsSchema) {}
export class GetReviewByIdParamsDto extends createZodDto(GetReviewByIdParamsSchema) {}
export class GetReviewResponseDto extends createZodDto(GetReviewResponseSchema) {}
export class GetReviewsResponseDto extends createZodDto(GetReviewsResponseSchema) {}

