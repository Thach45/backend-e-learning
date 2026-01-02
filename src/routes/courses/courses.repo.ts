import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { Prisma, CourseStatus, CourseLevel } from "@prisma/client";
import { PrismaService } from "src/shared/service/prisma.service";
import { CreateCourseBody, GetCoursesQuery, UpdateCourseBody } from "./courses.model";

const courseSelect = {
  id: true,
  title: true,
  price: true,
  salePrice: true,
  thumbnail: true,
  introVideo: true,
  isFeatured: true,
  level: true,
  status: true,
  instructorId: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  instructor: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
} as const;

@Injectable()
export class CoursesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCourses(query: GetCoursesQuery) {
    const { page, limit, search, level, status, categoryId, instructorId, isFeatured } = query;
    if (page < 1 || limit < 1) {
      throw new BadRequestException("Page and limit must be positive numbers");
    }

    const where: Prisma.CourseWhereInput = {
      deletedAt: null,
      ...(search
        ? { title: { contains: search, mode: Prisma.QueryMode.insensitive } }
        : {}),
      ...(level ? { level: level as unknown as CourseLevel } : {}),
      ...(status ? { status: status as unknown as CourseStatus } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(instructorId ? { instructorId } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        select: courseSelect,
      }),
      this.prisma.course.count({ where }),
    ]);

    const courseIds = rows.map(c => c.id);
    const [reviewSum, reviewCount, enrollmentCount, wishlistCount, lessonsData] = await Promise.all([
      this.prisma.review.groupBy({
        by: ["courseId"],
        where: { courseId: { in: courseIds } },
        _sum: { rating: true },
      }),
      this.prisma.review.groupBy({
        by: ["courseId"],
        where: { courseId: { in: courseIds } },
        _count: { _all: true },
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
      this.prisma.lesson.findMany({
        where: {
          content: {
            courseId: { in: courseIds },
            deletedAt: null,
            isActive: true,
          },
          deletedAt: null,
          isActive: true,
        },
        select: {
          content: {
            select: {
              courseId: true,
            },
          },
          duration: true,
        },
      }),
    ]);

    // Build maps for lessons count and total duration
    const lessonsCountMap = new Map<string, number>();
    const totalDurationMap = new Map<string, number>();
    
    lessonsData.forEach(lesson => {
      const courseId = lesson.content.courseId;
      if (courseId) {
        lessonsCountMap.set(courseId, (lessonsCountMap.get(courseId) || 0) + 1);
        totalDurationMap.set(courseId, (totalDurationMap.get(courseId) || 0) + (lesson.duration ?? 0));
      }
    });

    const sumMap = new Map(reviewSum.map(r => [r.courseId, r._sum.rating ?? 0]));
    const reviewsCountMap = new Map(reviewCount.map(r => [r.courseId, r._count._all]));
    const learnersMap = new Map(enrollmentCount.map(r => [r.courseId, r._count._all]));
    const likesMap = new Map(wishlistCount.map(r => [r.courseId, r._count._all]));

    const data = rows.map(c => ({
      ...c,
      totalStars: sumMap.get(c.id) ?? 0,
      reviewsCount: reviewsCountMap.get(c.id) ?? 0,
      totalLearners: learnersMap.get(c.id) ?? 0,
      totalLikes: likesMap.get(c.id) ?? 0,
      totalLessons: lessonsCountMap.get(c.id) ?? 0,
      totalDuration: totalDurationMap.get(c.id) ?? 0, // in seconds
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getCourseById(id: string) {
    // Get course with all related data
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
      select: {
        ...courseSelect,
        courseDetail: {
          select: {
            description: true,
            objectives: true,
            benefits: true,
            requirements: true,
            targetAudience: true,
          },
        },
        courseContents: {
          where: { 
            deletedAt: null,
            isActive: true,
            parentId: null, // Only top-level contents (chapters)
          },
          select: {
            id: true,
            title: true,
            orderIndex: true,
            lessons: {
              where: { 
                deletedAt: null,
                isActive: true,
              },
              select: {
                id: true,
                title: true,
                storageType: true,
                duration: true,
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });
    if (!course) throw new NotFoundException(`Course with ID ${id} not found`);

    // Get instructor with stats
    const instructorId = course.instructorId;
    const [instructor, instructorStats, courseReviews, courseEnrollments, allLessons, totalWishlist] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: instructorId },
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      }),
      // Get instructor's rating (average from all their courses' reviews)
      this.prisma.review.groupBy({
        by: ["courseId"],
        where: {
          course: {
            instructorId,
            deletedAt: null,
          },
        },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      // Get reviews for this course
      this.prisma.review.findMany({
        where: { courseId: id },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10, // Limit to 10 most recent reviews
      }),
      // Get enrollments count
      this.prisma.enrollment.count({ where: { courseId: id } }),
      // Get all lessons for duration calculation
      this.prisma.lesson.findMany({
        where: {
          content: {
            courseId: id,
            deletedAt: null,
            isActive: true,
          },
          deletedAt: null,
          isActive: true,
        },
        select: {
          duration: true,
        },
      }),
      this.prisma.wishlist.count({ where: { courseId: id } }),
    ]);

    // Calculate instructor stats
    const instructorCourses = await this.prisma.course.count({
      where: {
        instructorId,
        deletedAt: null,
        status: "PUBLISHED",
      },
    });

    const instructorTotalStudents = await this.prisma.enrollment.count({
      where: {
        course: {
          instructorId,
          deletedAt: null,
          status: "PUBLISHED",
        },
      },
    });

    const instructorAvgRating = instructorStats.length > 0
      ? instructorStats.reduce((sum, stat) => sum + (stat._avg.rating ?? 0), 0) / instructorStats.length
      : 0;

    // Calculate course stats
    const totalLessons = allLessons.length;
    const totalDurationSeconds = allLessons.reduce((sum, lesson) => sum + (lesson.duration ?? 0), 0);
    
    // Format duration
    const formatDuration = (seconds: number): string => {
      if (!seconds || seconds === 0) return '0h 0m';
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    };

    // Calculate course rating
    const [courseRatingSum, totalReviewsCount] = await Promise.all([
      this.prisma.review.aggregate({
        _sum: { rating: true },
        where: { courseId: id },
      }),
      this.prisma.review.count({ where: { courseId: id } }),
    ]);
    const courseRating = totalReviewsCount > 0 && courseRatingSum._sum.rating
      ? Math.round((courseRatingSum._sum.rating / totalReviewsCount) * 10) / 10
      : 0;

    // Format date
    const formatDate = (date: Date): string => {
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    };

    // Format lesson duration
    const formatLessonDuration = (seconds: number | null): string => {
      if (!seconds) return '0:00';
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    // Transform content structure
    const content = course.courseContents.map((section) => ({
      id: section.id,
      title: section.title,
      lessons: section.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        type: ['YOUTUBE', 'CLOUDINARY', 'DIRECT_UPLOAD'].includes(lesson.storageType) ? 'VIDEO' : 'TEXT',
        duration: formatLessonDuration(lesson.duration),
        isFree: false, // Can be determined based on business logic
      })),
    }));

    // Transform reviews
    const reviews = courseReviews.map((review) => ({
      id: review.id,
      user: {
        name: review.user.name,
        avatar: review.user.avatar,
      },
      rating: review.rating,
      comment: review.comment,
      createdAt: this.formatRelativeTime(review.createdAt),
      helpful: 0, // Can be added later if helpful feature is implemented
    }));

    return {
      id: course.id,
      title: course.title,
      price: course.price,
      salePrice: course.salePrice,
      originalPrice: course.salePrice ? course.price : undefined,
      thumbnail: course.thumbnail,
      introVideo: course.introVideo,
      isFeatured: course.isFeatured,
      level: course.level,
      status: course.status,
      updatedAt: formatDate(course.updatedAt),
      instructor: {
        id: instructor?.id || instructorId,
        name: instructor?.name || 'Unknown',
        avatar: instructor?.avatar,
        bio: null, // User model doesn't have bio field
        rating: Math.round(instructorAvgRating * 10) / 10,
        students: instructorTotalStudents,
        courses: instructorCourses,
      },
      category: course.category ? { name: course.category.name } : null,
      detail: course.courseDetail ? {
        description: course.courseDetail.description,
        objectives: course.courseDetail.objectives,
        benefits: course.courseDetail.benefits,
        requirements: course.courseDetail.requirements,
        targetAudience: course.courseDetail.targetAudience,
      } : null,
      content,
      reviews,
      totalLessons,
      totalDuration: formatDuration(totalDurationSeconds),
      rating: courseRating,
      reviewsCount: totalReviewsCount,
      studentsCount: courseEnrollments,
      totalWishlist: totalWishlist,
    };
  }

  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return '1 ngày trước';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} tuần trước`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} tháng trước`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} năm trước`;
  }

  async createCourse(body: CreateCourseBody, actor: { userId: string }) {
    const created = await this.prisma.course.create({
      data: {
        title: body.title,
        price: body.price ?? 0,
        salePrice: body.salePrice,
        thumbnail: body.thumbnail,
        introVideo: body.introVideo,
        isFeatured: body.isFeatured ?? false,
        level: body.level as unknown as CourseLevel,
        status: (body.status ?? "DRAFT") as unknown as CourseStatus,
        instructorId: actor.userId,
        categoryId: body.categoryId,
        createdBy: actor?.userId,
        updatedBy: actor?.userId,
      },
      select: courseSelect,
    });
    return created;
  }

  async updateCourse(id: string, body: UpdateCourseBody, actor?: { userId: string }) {
    const existing = await this.prisma.course.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
    if (!existing) throw new NotFoundException(`Course with ID ${id} not found`);

    const updated = await this.prisma.course.update({
      where: { id },
      data: {
        title: body.title ?? undefined,
        price: body.price ?? undefined,
        salePrice: body.salePrice ?? undefined,
        thumbnail: body.thumbnail ?? undefined,
        introVideo: body.introVideo ?? undefined,
        isFeatured: body.isFeatured ?? undefined,
        level: (body.level as unknown as CourseLevel) ?? undefined,
        categoryId: body.categoryId ?? undefined,
        updatedBy: actor?.userId,
      },
      select: courseSelect,
    });
    return updated;
  }

  async requestApproval(id: string, instructorId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true, instructorId: true },
    });
    if (!course) throw new NotFoundException(`Course with ID ${id} not found`);
    if (course.instructorId !== instructorId) {
      throw new BadRequestException("You can only request approval for your own courses");
    }
    if (course.status !== "DRAFT") {
      throw new BadRequestException("Only DRAFT courses can be requested for approval");
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data: { status: "PENDING_PUBLISHED" as unknown as CourseStatus, updatedBy: instructorId },
      select: courseSelect,
    });
    return updated;
  }

  async requestDelete(id: string, instructorId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true, instructorId: true },
    });
    if (!course) throw new NotFoundException(`Course with ID ${id} not found`);
    if (course.instructorId !== instructorId) {
      throw new BadRequestException("You can only request deletion for your own courses");
    }
    if (course.status !== "PUBLISHED") {
      throw new BadRequestException("Only PUBLISHED courses can be requested for deletion");
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data: { status: "PENDING_DRAFT" as unknown as CourseStatus, updatedBy: instructorId },
      select: courseSelect,
    });
    return updated;
  }

  async deleteCourse(id: string) {
    const existing = await this.prisma.course.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
    if (!existing) throw new NotFoundException(`Course with ID ${id} not found`);
    const deleted = await this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: courseSelect,
    });
    return deleted;
  }

  // Admin methods
  async approvePublish(id: string, adminId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true },
    });
    if (!course) throw new NotFoundException(`Course with ID ${id} not found`);
    if (course.status !== "PENDING_PUBLISHED") {
      throw new BadRequestException("Only PENDING_PUBLISHED courses can be approved for publishing");
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data: { status: "PUBLISHED" as unknown as CourseStatus, updatedBy: adminId },
      select: courseSelect,
    });
    return updated;
  }

  async rejectPublish(id: string, adminId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true },
    });
    if (!course) throw new NotFoundException(`Course with ID ${id} not found`);
    if (course.status !== "PENDING_PUBLISHED") {
      throw new BadRequestException("Only PENDING_PUBLISHED courses can be rejected");
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data: { status: "DRAFT" as unknown as CourseStatus, updatedBy: adminId },
      select: courseSelect,
    });
    return updated;
  }

  async approveDelete(id: string, adminId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true },
    });
    if (!course) throw new NotFoundException(`Course with ID ${id} not found`);
    if (course.status !== "PENDING_DRAFT") {
      throw new BadRequestException("Only PENDING_DRAFT courses can be approved for deletion");
    }

    const deleted = await this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: adminId },
      select: courseSelect,
    });
    return deleted;
  }

  async rejectDelete(id: string, adminId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true },
    });
    if (!course) throw new NotFoundException(`Course with ID ${id} not found`);
    if (course.status !== "PENDING_DRAFT") {
      throw new BadRequestException("Only PENDING_DRAFT courses can be rejected for deletion");
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data: { status: "PUBLISHED" as unknown as CourseStatus, updatedBy: adminId },
      select: courseSelect,
    });
    return updated;
  }

  async getCourseByIdAdmin(id: string) {
    // Get course with all related data
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
      select: {
        ...courseSelect,
        courseDetail: {
          select: {
            id: true,
            courseId: true,
            description: true,
            content: true,
            objectives: true,
            requirements: true,
            targetAudience: true,
            benefits: true,
            relatedCourses: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        courseContents: {
          where: { deletedAt: null },
          select: {
            id: true,
            courseId: true,
            parentId: true,
            title: true,
            orderIndex: true,
            createdAt: true,
            updatedAt: true,
            lessons: {
              where: { deletedAt: null },
              select: {
                id: true,
                contentId: true,
                title: true,
                storageType: true,
                storageUrl: true,
                contentText: true,
                duration: true,
                createdAt: true,
                updatedAt: true,
              },
              
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!course) throw new NotFoundException(`Course with ID ${id} not found`);

    // Get stats
    const [sum, learners, likes] = await Promise.all([
      this.prisma.review.aggregate({ _sum: { rating: true }, where: { courseId: id } }),
      this.prisma.enrollment.count({ where: { courseId: id } }),
      this.prisma.wishlist.count({ where: { courseId: id } }),
    ]);

    // Build hierarchical structure for courseContents
    type ContentNode = typeof course.courseContents[0] & { children: ContentNode[] };
    const contentMap = new Map<string, ContentNode>(
      course.courseContents.map(c => [c.id, { ...c, children: [] }])
    );
    const rootContents: ContentNode[] = [];

    for (const content of course.courseContents) {
      const node = contentMap.get(content.id)!;
      if (content.parentId) {
        const parent = contentMap.get(content.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          rootContents.push(node);
        }
      } else {
        rootContents.push(node);
      }
    }

    return {
      ...course,
      courseDetail: course.courseDetail || null,
      courseContents: rootContents,
      totalStars: sum._sum.rating ?? 0,
      totalLearners: learners,
      totalLikes: likes,
    };
  }
}


