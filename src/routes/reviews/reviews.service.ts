import { Injectable } from "@nestjs/common";
import { ReviewsRepository } from "./reviews.repo";
import { CreateReviewBody, GetReviewsQuery, UpdateReviewBody } from "./reviews.model";

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepo: ReviewsRepository) {}

  async getReviews(query: GetReviewsQuery) {
    return this.reviewsRepo.getReviews(query);
  }

  async getReviewByCourseId(courseId: string, userId: string) {
    return this.reviewsRepo.getReviewByCourseId(courseId, userId);
  }

  async createReview(body: CreateReviewBody, userId: string) {
    return this.reviewsRepo.createReview(body, userId);
  }

  async createOrUpdateReview(body: CreateReviewBody, userId: string) {
    return this.reviewsRepo.createOrUpdateReview(body, userId);
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
}

