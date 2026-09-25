import { Injectable, BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { GetWishlistQuery } from "./wishlist.model";
import { Prisma } from "@prisma/client";

const wishlistSelect = {
  id: true,
  userId: true,
  courseId: true,
  createdAt: true,
  course: {
    select: {
      id: true,
      title: true,
      thumbnail: true,
      price: true,
      salePrice: true,
      introVideo: true,
      isFeatured: true,
      level: true,
      status: true,
      instructor: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  },
} as const;

@Injectable()
export class WishlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getWishlist(query: GetWishlistQuery, userId: string) {
    const { page, limit } = query;
    if (page < 1 || limit < 1) {
      throw new BadRequestException("Page and limit must be positive numbers");
    }

    const where: Prisma.WishlistWhereInput = {
      userId,
    };

    const [rows, total] = await Promise.all([
      this.prisma.wishlist.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        select: wishlistSelect,
      }),
      this.prisma.wishlist.count({ where }),
    ]);

    // Calculate aggregate data for courses
    const courseIds = rows.map(w => w.courseId);
    const [reviewSum, enrollmentCount, wishlistCount] = await Promise.all([
      this.prisma.review.groupBy({
        by: ["courseId"],
        where: { courseId: { in: courseIds } },
        _sum: { rating: true },
      }),
      this.prisma.enrollment.groupBy({
        by: ["courseId"],
        where: { courseId: { in: courseIds } },
        _count: { _all: true },
      }),
      this.prisma.wishlist.groupBy({
        by: ["courseId"],
        where: { courseId: { in: courseIds } },
        _count: { _all: true },
      }),
    ]);

    const sumMap = new Map(reviewSum.map(r => [r.courseId, r._sum.rating ?? 0]));
    const learnersMap = new Map(enrollmentCount.map(r => [r.courseId, r._count._all]));
    const likesMap = new Map(wishlistCount.map(r => [r.courseId, r._count._all]));

    const data = rows.map(w => ({
      ...w,
      course: w.course
        ? {
            ...w.course,
            totalStars: sumMap.get(w.course.id) ?? 0,
            totalLearners: learnersMap.get(w.course.id) ?? 0,
            totalLikes: likesMap.get(w.course.id) ?? 0,
          }
        : undefined,
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async addToWishlist(courseId: string, userId: string) {
    // Validate course exists and is PUBLISHED
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, status: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.status !== "PUBLISHED") {
      throw new BadRequestException("Only PUBLISHED courses can be added to wishlist");
    }

    // Check if already in wishlist (unique constraint)
    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException("Course is already in your wishlist");
    }

    const created = await this.prisma.wishlist.create({
      data: {
        userId,
        courseId,
      },
      select: wishlistSelect,
    });

    // Calculate aggregate data for the course
    const [sum, learners, likes] = await Promise.all([
      this.prisma.review.aggregate({ _sum: { rating: true }, where: { courseId } }),
      this.prisma.enrollment.count({ where: { courseId } }),
      this.prisma.wishlist.count({ where: { courseId } }),
    ]);

    return {
      ...created,
      course: created.course
        ? {
            ...created.course,
            totalStars: sum._sum.rating ?? 0,
            totalLearners: learners,
            totalLikes: likes,
          }
        : undefined,
    };
  }

  async removeFromWishlist(courseId: string, userId: string) {
    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException("Course is not in your wishlist");
    }

    await this.prisma.wishlist.delete({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    return { success: true, message: "Course removed from wishlist" };
  }

  async checkWishlist(courseId: string, userId: string) {
    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: { id: true },
    });

    return { isInWishlist: !!existing };
  }

  async getWishlistByCourseId(courseId: string, userId: string) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: wishlistSelect,
    });
    if (!wishlist) {
      throw new NotFoundException("Course is not in your wishlist");
    }

    // Calculate aggregate data for the course
    const [sum, learners, likes] = await Promise.all([
      this.prisma.review.aggregate({ _sum: { rating: true }, where: { courseId } }),
      this.prisma.enrollment.count({ where: { courseId } }),
      this.prisma.wishlist.count({ where: { courseId } }),
    ]);

    return {
      ...wishlist,
      course: wishlist.course
        ? {
            ...wishlist.course,
            totalStars: sum._sum.rating ?? 0,
            totalLearners: learners,
            totalLikes: likes,
          }
        : undefined,
    };
  }
}

