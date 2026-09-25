import { Body, Controller, Get, Post, Put, Query } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { LearningProfileService } from "./learning-profile.service";
import {
  GetRecommendationsQueryDto,
  LearningProfileResponseDto,
  RecommendationsResponseDto,
  UpdateLearningProfileBodyDto,
} from "./learning-profile.dto";

@Controller("api")
export class LearningProfileController {
  constructor(private readonly service: LearningProfileService) {}

  @Get("profile/learning")
  @ZodSerializerDto(LearningProfileResponseDto)
  get(@ActiveUser() user: any) {
    return this.service.getProfile(user.userId);
  }

  @Put("profile/learning")
  @ZodSerializerDto(LearningProfileResponseDto)
  update(@Body() body: UpdateLearningProfileBodyDto, @ActiveUser() user: any) {
    return this.service.updateProfile(user.userId, body);
  }

  @Post("profile/learning/skip")
  @ZodSerializerDto(LearningProfileResponseDto)
  skip(@ActiveUser() user: any) {
    return this.service.skipOnboarding(user.userId);
  }

  @Get("recommendations/for-me")
  @ZodSerializerDto(RecommendationsResponseDto)
  recommend(@Query() query: GetRecommendationsQueryDto, @ActiveUser() user: any) {
    return this.service.recommend(user.userId, query);
  }
}
