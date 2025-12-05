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

  async getInstructorStudents(instructorId: string, query: GetEnrollmentsQuery) {
    const { page, limit, search } = query;
    if (page < 1 || limit < 1) {
      throw new BadRequestException("Page and limit must be positive numbers");
    }

    // Get all courses of instructor
    const instructorCourses = await this.prisma.course.findMany({
      where: {
        instructorId,
        deletedAt: null,
      },
      select: { id: true },
    });
    const courseIds = instructorCourses.map(c => c.id);

    if (courseIds.length === 0) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    // Build where clause
    const where: Prisma.EnrollmentWhereInput = {
      courseId: { in: courseIds },
      ...(search
        ? {
            OR: [
              { user: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
              { user: { email: { contains: search, mode: Prisma.QueryMode.insensitive } } },
              { course: { title: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            ],
          }
        : {}),
    };

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { enrolledAt: "desc" },
        select: enrollmentSelect,
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    // Get learning progress for all enrollments
    const enrollmentIds = enrollments.map(e => e.id);
    const allProgress = await this.prisma.learningProgress.findMany({
      where: {
        userId: { in: enrollments.map(e => e.userId) },
        courseId: { in: courseIds },
      },
      select: {
        userId: true,
        courseId: true,
        progressPercent: true,
        lastAccessed: true,
      },
    });

    // Calculate overall progress for each enrollment
    const data = enrollments.map((enrollment) => {
      // Get all progress records for this user in this course
      const progressRecords = allProgress.filter(
        p => p.userId === enrollment.userId && p.courseId === enrollment.courseId
      );
      
      // Calculate average progress
      const avgProgress = progressRecords.length > 0
        ? Math.round(progressRecords.reduce((sum, p) => sum + p.progressPercent, 0) / progressRecords.length)
        : 0;
      
      // Get most recent lastAccessed
      const lastAccessed = progressRecords.length > 0
        ? progressRecords.reduce((latest, p) => 
            p.lastAccessed > latest ? p.lastAccessed : latest, 
            progressRecords[0].lastAccessed
          )
        : enrollment.enrolledAt;

      return {
        id: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        course: enrollment.course,
        user: enrollment.user,
        progress: avgProgress,
        lastAccessed,
      };
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

