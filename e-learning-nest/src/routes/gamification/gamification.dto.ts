import { createZodDto } from "nestjs-zod";
import {
  GetMyBadgesResponseSchema,
  StreakResponseSchema,
  GetLeaderboardResponseSchema,
} from "./gamification.model";

export class GetMyBadgesResponseDto extends createZodDto(GetMyBadgesResponseSchema) {}
export class StreakResponseDto extends createZodDto(StreakResponseSchema) {}
export class GetLeaderboardResponseDto extends createZodDto(GetLeaderboardResponseSchema) {}
