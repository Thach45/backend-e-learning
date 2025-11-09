import { Injectable, BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { CreateEnrollmentBody, GetEnrollmentsQuery } from "./enrollments.model";
import { Prisma } from "@prisma/client";

const enrollmentSelect = {
  id: true,
  userId: true,
  courseId: true,
  enrolledAt: true,
  completedAt: true,
  course: {
    select: {
      id: true,
      title: true,
      thumbnail: true,
      price: true,
      salePrice: true,
      instructor: { select: { id: true, name: true } },
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
export class EnrollmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getEnrollments(query: GetEnrollmentsQuery, userId?: string) {
    const { page, limit, courseId, userId: queryUserId, completed } = query;
    if (page < 1 || limit < 1) {
      throw new BadRequestException("Page and limit must be positive numbers");
    }

    const where: Prisma.EnrollmentWhereInput = {
      ...(userId ? { userId } : {}),
      ...(queryUserId ? { userId: queryUserId } : {}),
      ...(courseId ? { courseId } : {}),
      ...(completed !== undefined ? { completedAt: completed ? { not: null } : null } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { enrolledAt: "desc" },
        select: enrollmentSelect,
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getEnrollmentByCourseId(courseId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: enrollmentSelect,
    });
    if (!enrollment) {
      throw new NotFoundException(`Enrollment for course ${courseId} not found`);
    }
    return enrollment;
  }

  async createEnrollment(body: CreateEnrollmentBody, userId: string) {
    // Validate course exists and is PUBLISHED
    const course = await this.prisma.course.findFirst({
      where: { id: body.courseId, deletedAt: null },
      select: { id: true, status: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${body.courseId} not found`);
    }
    if (course.status !== "PUBLISHED") {
      throw new BadRequestException("Only PUBLISHED courses can be enrolled");
    }

    // Check if already enrolled (unique constraint)
    const existing = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: body.courseId,
        },
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException("You are already enrolled in this course");
    }

    const created = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId: body.courseId,
      },
      select: enrollmentSelect,
    });
    return created;
  }

  async completeEnrollment(courseId: string, userId: string) {
    const existing = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: { id: true, completedAt: true },
    });
    if (!existing) {
      throw new NotFoundException(`Enrollment for course ${courseId} not found`);
    }
    if (existing.completedAt) {
      throw new BadRequestException("Course is already completed");
    }

    const updated = await this.prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: { completedAt: new Date() },
      select: enrollmentSelect,
    });
    return updated;
  }

  async getEnrollmentsByCourse(courseId: string, instructorId: string, query: GetEnrollmentsQuery) {
    // Validate course exists and belongs to instructor
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new BadRequestException("You can only view enrollments for your own courses");
    }

    return this.getEnrollments({ ...query, courseId });
  }
}

