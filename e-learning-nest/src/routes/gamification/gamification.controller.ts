import { Controller, Get } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { GamificationService } from "./gamification.service";
import { GetMyBadgesResponseDto, StreakResponseDto, GetLeaderboardResponseDto } from "./gamification.dto";

@Controller("api/gamification")
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get("badges")
  @ZodSerializerDto(GetMyBadgesResponseDto)
  async getMyBadges(@ActiveUser() user: any) {
    return this.gamificationService.getMyBadges(user.userId);
  }

  @Get("streak")
  @ZodSerializerDto(StreakResponseDto)
  async getStreak(@ActiveUser() user: any) {
    return this.gamificationService.getStreak(user.userId);
  }

  @Get("leaderboard")
  @ZodSerializerDto(GetLeaderboardResponseDto)
  async getLeaderboard() {
    return this.gamificationService.getLeaderboard();
  }
}
