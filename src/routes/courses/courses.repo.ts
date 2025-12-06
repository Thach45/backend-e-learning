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
    const { page, limit, search, level, status, categoryId, instructorId } = query;
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

    const data = rows.map(c => ({
      ...c,
      totalStars: sumMap.get(c.id) ?? 0,
      totalLearners: learnersMap.get(c.id) ?? 0,
      totalLikes: likesMap.get(c.id) ?? 0,
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getCourseById(id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
      select: courseSelect,
    });
    if (!course) throw new NotFoundException(`Course with ID ${id} not found`);
    const [sum, learners, likes] = await Promise.all([
      this.prisma.review.aggregate({ _sum: { rating: true }, where: { courseId: id } }),
      this.prisma.enrollment.count({ where: { courseId: id } }),
      this.prisma.wishlist.count({ where: { courseId: id } }),
    ]);
    return {
      ...course,
      totalStars: sum._sum.rating ?? 0,
      totalLearners: learners,
      totalLikes: likes,
    };
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


