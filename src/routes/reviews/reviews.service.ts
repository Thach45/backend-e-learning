import { Injectable } from "@nestjs/common";
import { ReviewsRepository } from "./reviews.repo";
import { CreateReviewBody, GetReviewsQuery, ReplyReviewBody, UpdateReviewBody } from "./reviews.model";
import { GamificationService } from "src/routes/gamification/gamification.service";

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepo: ReviewsRepository,
    private readonly gamificationService: GamificationService,
  ) {}

  async getReviews(query: GetReviewsQuery) {
    return this.reviewsRepo.getReviews(query);
  }

  async getReviewByCourseId(courseId: string, userId: string) {
    return this.reviewsRepo.getReviewByCourseId(courseId, userId);
  }

  async createReview(body: CreateReviewBody, userId: string) {
    const result = await this.reviewsRepo.createReview(body, userId);
    await this.gamificationService.checkReviewBadge(userId);
    return result;
  }

  async createOrUpdateReview(body: CreateReviewBody, userId: string) {
    const result = await this.reviewsRepo.createOrUpdateReview(body, userId);
    await this.gamificationService.checkReviewBadge(userId);
    return result;
  }

  async updateReview(reviewId: string, courseId: string, body: UpdateReviewBody, instructorId?: string) {
    return this.reviewsRepo.updateReview(reviewId, courseId, body, instructorId);
  }

  async deleteReview(reviewId: string, courseId: string, instructorId?: string) {
    return this.reviewsRepo.deleteReview(reviewId, courseId, instructorId);
  }

  async getReviewsByCourse(courseId: string, instructorId: string, query: GetReviewsQuery) {
    return this.reviewsRepo.getReviewsByCourse(courseId, instructorId, query);
  }

  async replyToReview(reviewId: string, courseId: string, instructorId: string, body: ReplyReviewBody) {
    return this.reviewsRepo.replyToReview(reviewId, courseId, instructorId, body);
  }
}

