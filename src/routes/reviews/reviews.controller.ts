import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { ReviewsService } from "./reviews.service";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import {
  CreateReviewBodyDto,
  UpdateReviewBodyDto,
  GetReviewsQueryDto,
  GetReviewParamsDto,
  GetReviewByIdParamsDto,
  GetReviewResponseDto,
  GetReviewsResponseDto,
} from "./reviews.dto";

@Controller("api")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Client endpoints
  @Post("courses/:courseId/reviews")
  @ZodSerializerDto(GetReviewResponseDto)
  async createReview(
    @Param() params: GetReviewParamsDto,
    @Body() body: CreateReviewBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.reviewsService.createReview(
      { ...body, courseId: (params as any).courseId },
      user.userId,
    );
  }

  @Get("courses/:courseId/reviews")
  @ZodSerializerDto(GetReviewsResponseDto)
  async getReviewsByCourse(
    @Param() params: GetReviewParamsDto,
    @Query() query: GetReviewsQueryDto,
  ) {
    return this.reviewsService.getReviews({
      ...(query as any),
      courseId: (params as any).courseId,
    });
  }

  @Get("my-reviews/:courseId")
  @ZodSerializerDto(GetReviewResponseDto)
  async getMyReview(@Param() params: GetReviewParamsDto, @ActiveUser() user: any) {
    return this.reviewsService.getReviewByCourseId((params as any).courseId, user.userId);
  }

  // Instructor endpoints
  @Get("instructor/courses/:courseId/reviews")
  @ZodSerializerDto(GetReviewsResponseDto)
  async getCourseReviews(
    @Param() params: GetReviewParamsDto,
    @Query() query: GetReviewsQueryDto,
    @ActiveUser() user: any,
  ) {
    return this.reviewsService.getReviewsByCourse(
      (params as any).courseId,
      user.userId,
      query as any,
    );
  }

  @Put("instructor/courses/:courseId/reviews/:reviewId")
  @ZodSerializerDto(GetReviewResponseDto)
  async updateReview(
    @Param() params: GetReviewByIdParamsDto,
    @Body() body: UpdateReviewBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.reviewsService.updateReview(
      (params as any).reviewId,
      (params as any).courseId,
      body as any,
      user.userId,
    );
  }

  @Delete("instructor/courses/:courseId/reviews/:reviewId")
  async deleteReview(
    @Param() params: GetReviewByIdParamsDto,
    @ActiveUser() user: any,
  ) {
    return this.reviewsService.deleteReview(
      (params as any).reviewId,
      (params as any).courseId,
      user.userId,
    );
  }

  // Admin endpoints
  @Get("admin/courses/:courseId/reviews")
  @ZodSerializerDto(GetReviewsResponseDto)
  async getCourseReviewsAdmin(
    @Param() params: GetReviewParamsDto,
    @Query() query: GetReviewsQueryDto,
  ) {
    return this.reviewsService.getReviews({
      ...(query as any),
      courseId: (params as any).courseId,
    });
  }

  @Put("admin/courses/:courseId/reviews/:reviewId")
  @ZodSerializerDto(GetReviewResponseDto)
  async updateReviewAdmin(
    @Param() params: GetReviewByIdParamsDto,
    @Body() body: UpdateReviewBodyDto,
  ) {
    return this.reviewsService.updateReview(
      (params as any).reviewId,
      (params as any).courseId,
      body as any,
    );
  }

  @Delete("admin/courses/:courseId/reviews/:reviewId")
  async deleteReviewAdmin(@Param() params: GetReviewByIdParamsDto) {
    return this.reviewsService.deleteReview(
      (params as any).reviewId,
      (params as any).courseId,
    );
  }
}

