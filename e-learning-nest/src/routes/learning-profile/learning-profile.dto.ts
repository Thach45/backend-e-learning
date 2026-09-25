import { createZodDto } from "nestjs-zod";
import {
  GetRecommendationsQuerySchema,
  LearningProfileResponseSchema,
  RecommendationsResponseSchema,
  UpdateLearningProfileBodySchema,
} from "./learning-profile.model";

export class UpdateLearningProfileBodyDto extends createZodDto(UpdateLearningProfileBodySchema) {}
export class LearningProfileResponseDto extends createZodDto(LearningProfileResponseSchema) {}
export class GetRecommendationsQueryDto extends createZodDto(GetRecommendationsQuerySchema) {}
export class RecommendationsResponseDto extends createZodDto(RecommendationsResponseSchema) {}
