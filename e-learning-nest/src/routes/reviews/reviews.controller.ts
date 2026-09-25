import { Audit } from 'src/shared/decorator/audit.decorator';
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
  ReplyReviewBodyDto,
  ReviewIdParamsDto,
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
    @ActiveUser() user: any,
  ) {
    // Không trả email người viết; có kèm trạng thái "Hữu ích" của người đang xem
    return this.reviewsService.getReviews(
      { ...(query as any), courseId: (params as any).courseId },
      { viewerId: user?.userId, includeEmail: false },
    );
  }

  @Post("reviews/:reviewId/helpful")
  async markHelpful(@Param() params: ReviewIdParamsDto, @ActiveUser() user: any) {
    return this.reviewsService.setHelpful(params.reviewId, user.userId, true);
  }

  @Delete("reviews/:reviewId/helpful")
  async unmarkHelpful(@Param() params: ReviewIdParamsDto, @ActiveUser() user: any) {
    return this.reviewsService.setHelpful(params.reviewId, user.userId, false);
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

  @Post("instructor/courses/:courseId/reviews/:reviewId/reply")
  @ZodSerializerDto(GetReviewResponseDto)
  async replyToReview(
    @Param() params: GetReviewByIdParamsDto,
    @Body() body: ReplyReviewBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.reviewsService.replyToReview(
      (params as any).reviewId,
      (params as any).courseId,
      user.userId,
      body,
    );
  }

  // Admin endpoints
  @Get("admin/reviews")
  @ZodSerializerDto(GetReviewsResponseDto)
  async getReviewsAdmin(@Query() query: GetReviewsQueryDto) {
    return this.reviewsService.getReviews(query as any);
  }

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

  @Audit('review.admin_update', 'Review', { idParam: 'reviewId' })
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

  @Audit('review.admin_delete', 'Review', { idParam: 'reviewId' })
  @Delete("admin/courses/:courseId/reviews/:reviewId")
  async deleteReviewAdmin(@Param() params: GetReviewByIdParamsDto) {
    return this.reviewsService.deleteReview(
      (params as any).reviewId,
      (params as any).courseId,
    );
  }
}

