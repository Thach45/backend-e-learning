import { Injectable, BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { CreateReviewBody, GetReviewsQuery, UpdateReviewBody } from "./reviews.model";
import { Prisma } from "@prisma/client";

const reviewSelect = {
  id: true,
  userId: true,
  courseId: true,
  rating: true,
  comment: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  },
  course: {
    select: {
      id: true,
      title: true,
    },
  },
} as const;

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getReviews(query: GetReviewsQuery) {
    const { page, limit, courseId, userId, rating } = query;
    if (page < 1 || limit < 1) {
      throw new BadRequestException("Page and limit must be positive numbers");
    }

    const where: Prisma.ReviewWhereInput = {
      ...(courseId ? { courseId } : {}),
      ...(userId ? { userId } : {}),
      ...(rating ? { rating } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        select: reviewSelect,
      }),
      this.prisma.review.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getReviewByCourseId(courseId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: reviewSelect,
    });
    if (!review) {
      throw new NotFoundException(`Review for course ${courseId} not found`);
    }
    return review;
  }

  async createReview(body: CreateReviewBody, userId: string) {
    // Validate course exists and is PUBLISHED
    const course = await this.prisma.course.findFirst({
      where: { id: body.courseId, deletedAt: null },
      select: { id: true, status: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${body.courseId} not found`);
    }
    if (course.status !== "PUBLISHED") {
      throw new BadRequestException("Only PUBLISHED courses can be reviewed");
    }

    // Check if user has enrolled in the course
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: body.courseId,
        },
      },
      select: { id: true },
    });
    if (!enrollment) {
      throw new BadRequestException("You must enroll in the course before reviewing");
    }

    // Check if review already exists (unique constraint)
    const existing = await this.prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: body.courseId,
        },
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("You have already reviewed this course");
    }

    // Create new review
    const created = await this.prisma.review.create({
      data: {
        userId,
        courseId: body.courseId,
        rating: body.rating,
        comment: body.comment ?? null,
      },
      select: reviewSelect,
    });
    return created;
  }

  async createOrUpdateReview(body: CreateReviewBody, userId: string) {
    // Validate course exists and is PUBLISHED
    const course = await this.prisma.course.findFirst({
      where: { id: body.courseId, deletedAt: null },
      select: { id: true, status: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${body.courseId} not found`);
    }
    if (course.status !== "PUBLISHED") {
      throw new BadRequestException("Only PUBLISHED courses can be reviewed");
    }

    // Check if review already exists (unique constraint)
    const existing = await this.prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: body.courseId,
        },
      },
      select: { id: true },
    });

    if (existing) {
      // Update existing review
      const updated = await this.prisma.review.update({
        where: { id: existing.id },
        data: {
          rating: body.rating,
          comment: body.comment ?? null,
        },
        select: reviewSelect,
      });
      return updated;
    } else {
      // Create new review
      const created = await this.prisma.review.create({
        data: {
          userId,
          courseId: body.courseId,
          rating: body.rating,
          comment: body.comment ?? null,
        },
        select: reviewSelect,
      });
      return created;
    }
  }

  async updateReview(reviewId: string, courseId: string, body: UpdateReviewBody, instructorId?: string) {
    // Validate review exists
    const existing = await this.prisma.review.findFirst({
      where: { id: reviewId, courseId },
      select: { id: true, course: { select: { id: true, instructorId: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // If instructor, validate course ownership
    if (instructorId && existing.course.instructorId !== instructorId) {
      throw new BadRequestException("You can only update reviews for your own courses");
    }

    const updateData: any = {};
    if (body.rating !== undefined) {
      updateData.rating = body.rating;
    }
    if (body.comment !== undefined) {
      updateData.comment = body.comment;
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      select: reviewSelect,
    });
    return updated;
  }

  async deleteReview(reviewId: string, courseId: string, instructorId?: string) {
    // Validate review exists
    const existing = await this.prisma.review.findFirst({
      where: { id: reviewId, courseId },
      select: { id: true, course: { select: { id: true, instructorId: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // If instructor, validate course ownership
    if (instructorId && existing.course.instructorId !== instructorId) {
      throw new BadRequestException("You can only delete reviews for your own courses");
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });
    return { success: true };
  }

  async getReviewsByCourse(courseId: string, instructorId: string, query: GetReviewsQuery) {
    // Validate course exists and belongs to instructor
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new BadRequestException("You can only view reviews for your own courses");
    }

    return this.getReviews({ ...query, courseId });
  }
}

