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
    const { page, limit, courseId, userId: queryUserId, completed, search } = query;
    if (page < 1 || limit < 1) {
      throw new BadRequestException("Page and limit must be positive numbers");
    }

    const where: Prisma.EnrollmentWhereInput = {
      ...(userId ? { userId } : {}),
      ...(queryUserId ? { userId: queryUserId } : {}),
      ...(courseId ? { courseId } : {}),
      ...(completed !== undefined ? { completedAt: completed ? { not: null } : null } : {}),
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

  async getEnrollmentStats(userId: string) {
    // Get total enrollments
    const totalCourses = await this.prisma.enrollment.count({
      where: { userId },
    });

    // Get completed enrollments
    const completedCourses = await this.prisma.enrollment.count({
      where: {
        userId,
        completedAt: { not: null },
      },
    });

    // Certificates = completed courses (can be extended later)
    const certificates = completedCourses;

    // Calculate learning hours from lesson durations
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    });

    const courseIds = enrollments.map(e => e.courseId);
    const lessons = await this.prisma.lesson.findMany({
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
        duration: true,
      },
    });

    // Sum all lesson durations (in seconds) and convert to hours
    const totalSeconds = lessons.reduce((sum, lesson) => sum + (lesson.duration ?? 0), 0);
    const learningHours = Math.round((totalSeconds / 3600) * 10) / 10; // Round to 1 decimal

    return {
      totalCourses,
      completedCourses,
      certificates,
      learningHours,
    };
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

  async createEnrollmentByInstructor(courseId: string, userId: string, instructorId: string) {
    // Validate course exists and belongs to instructor
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true, status: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new BadRequestException("You can only enroll students in your own courses");
    }

    // Check if user exists
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if already enrolled (unique constraint)
    const existing = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException("User is already enrolled in this course");
    }

    const created = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
        completedAt: new Date(),
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

  async removeStudent(enrollmentId: string, instructorId: string) {
    // Validate enrollment exists and belongs to instructor's course
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        id: true,
        courseId: true,
        course: {
          select: {
            id: true,
            instructorId: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${enrollmentId} not found`);
    }

    if (enrollment.course.instructorId !== instructorId) {
      throw new BadRequestException("You can only remove students from your own courses");
    }

    // Delete enrollment
    const deleted = await this.prisma.enrollment.delete({
      where: { id: enrollmentId },
      select: enrollmentSelect,
    });

    return deleted;
  }

  async getCourseContentsForEnrolledUser(courseId: string, userId: string) {
    // Check if user is enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: { id: true },
    });
    if (!enrollment) {
      throw new NotFoundException("You are not enrolled in this course");
    }

    // Get course with contents
    const course = await this.prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        thumbnail: true,
      },
    });

    // Get course contents separately
    const courseContents = await this.prisma.courseContent.findMany({
      where: {
        courseId,
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
          },
          select: {
            id: true,
            title: true,
            storageType: true,
            duration: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { orderIndex: "asc" },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Format lesson duration
    const formatLessonDuration = (seconds: number | null): string => {
      if (!seconds) return "0:00";
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    // Calculate section duration
    const calculateSectionDuration = (lessons: any[]): string => {
      const totalSeconds = lessons.reduce((sum, lesson) => sum + (lesson.duration ?? 0), 0);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${minutes}p`;
      }
      return `${minutes}p`;
    };

    // Transform content structure
    const contents = courseContents.map((section) => {
      const lessons = section.lessons.map((lesson) => {
        // Determine lesson type based on storageType
        let type: "VIDEO" | "TEXT" | "QUIZ" | "GAME" = "TEXT";
        if (
          lesson.storageType === "YOUTUBE" ||
          lesson.storageType === "CLOUDINARY" ||
          lesson.storageType === "DIRECT_UPLOAD"
        ) {
          type = "VIDEO";
        }

        return {
          id: lesson.id,
          title: lesson.title,
          type,
          duration: formatLessonDuration(lesson.duration),
          isLocked: false, // Will be determined by learning progress later
        };
      });

      return {
        id: section.id,
        title: section.title,
        orderIndex: section.orderIndex,
        duration: calculateSectionDuration(section.lessons),
        lessons,
      };
    });

    return {
      courseId: course.id,
      courseTitle: course.title,
      thumbnailUrl: course.thumbnail,
      contents,
    };
  }

  async getLessonDetailForEnrolledUser(courseId: string, lessonId: string, userId: string) {
    // Check if user is enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: { id: true },
    });
    if (!enrollment) {
      throw new NotFoundException("You are not enrolled in this course");
    }

    // Get lesson with course content
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        id: lessonId,
        deletedAt: null,
        isActive: true,
        content: {
          courseId,
          deletedAt: null,
          isActive: true,
        },
      },
      select: {
        id: true,
        title: true,
        storageType: true,
        storageUrl: true,
        contentText: true,
        duration: true,
        content: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    // Determine lesson type
    let type: "VIDEO" | "TEXT" | "QUIZ" | "GAME" = "TEXT";
    if (
      lesson.storageType === "YOUTUBE" ||
      lesson.storageType === "CLOUDINARY" ||
      lesson.storageType === "DIRECT_UPLOAD"
    ) {
      type = "VIDEO";
    }

    // Get supplementary materials as resources (for this lesson)
    const resources = await this.prisma.supplementaryMaterial.findMany({
      where: {
        lessonId,
      },
      select: {
        id: true,
        title: true,
        url: true,
        materialType: true,
      },
    });

    // Get course detail for description
    const courseDetail = await this.prisma.courseDetail.findUnique({
      where: { courseId },
      select: {
        description: true,
      },
    });

    return {
      id: lesson.id,
      title: lesson.title,
      type,
      storageType: lesson.storageType,
      storageUrl: lesson.storageUrl,
      contentText: lesson.contentText,
      duration: lesson.duration,
      description: courseDetail?.description || null,
      resources: resources.map((res) => ({
        name: res.title,
        url: res.url,
        type: res.materialType || "FILE",
      })),
    };
  }
}

