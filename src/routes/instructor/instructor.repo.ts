import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/service/prisma.service';
import { OrderStatus } from '@prisma/client';
import type {
  InstructorStats,
  CourseAnalytics,
  RevenueChartData,
  EnrolledStudent,
  GetEnrolledStudentsQuery,
  GetEnrolledStudentsResponse,
  UpdateInstructorProfileBody,
  InstructorProfileResponse,
  CourseDropoffAnalytics,
  CoursePreviewContents,
  PreviewLessonDetail,
} from './instructor.model';

@Injectable()
export class InstructorRepo {
  constructor(private readonly prisma: PrismaService) {}

  async getInstructorStats(instructorId: string): Promise<InstructorStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      totalRevenue,
      monthlyRevenue,
      averageRating,
      totalStudents,
      totalReviews,
    ] = await Promise.all([
      this.prisma.course.count({
        where: { instructorId },
      }),
      this.prisma.course.count({
        where: { instructorId, status: 'PUBLISHED' },
      }),
      this.prisma.course.count({
        where: { instructorId, status: 'DRAFT' },
      }),
      this.prisma.enrollment.count({
        where: {
          course: { instructorId },
        },
      }),
      this.prisma.orderItem.aggregate({
        where: {
          course: { instructorId },
          order: { status: OrderStatus.PAID },
        },
        _sum: { price: true },
      }),
      
      this.prisma.orderItem.aggregate({
        where: {
          course: { instructorId },
          order: {
            status: OrderStatus.PAID,
            createdAt: { gte: startOfMonth },
          },
        },
        _sum: { price: true },
      }),
      this.prisma.review.aggregate({
        where: {
          course: { instructorId },
        },
        _avg: { rating: true },
      }),
      this.prisma.enrollment.groupBy({
        by: ['userId'],
        where: {
          course: { instructorId },
        },
      }).then(result => result.length),
      this.prisma.review.count({
        where: {
          course: { instructorId },
        },
      }),
    ]);
    
    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      totalRevenue: totalRevenue._sum?.price || 0,
      monthlyRevenue: monthlyRevenue._sum?.price || 0,
      averageRating: averageRating._avg?.rating || 0,
      totalStudents,
      totalReviews,
    };
  }

  async getCourseAnalytics(instructorId: string): Promise<CourseAnalytics[]> {
    const courses = await this.prisma.course.findMany({
      where: { instructorId },
      select: {
        id: true,
        title: true,
      },
    });

    const analytics = await Promise.all(
      courses.map(async (course) => {
        const [
          enrollments,
          revenue,
          avgRating,
          totalReviews,
          completedEnrollments,
          views,
        ] = await Promise.all([
          this.prisma.enrollment.count({
            where: { courseId: course.id },
          }),
          this.prisma.orderItem.aggregate({
            where: {
              courseId: course.id,
              order: { status: OrderStatus.PAID },
            },
            _sum: { price: true },
          }),
          this.prisma.review.aggregate({
            where: { courseId: course.id },
            _avg: { rating: true },
          }),
          this.prisma.review.count({
            where: { courseId: course.id },
          }),
          this.prisma.enrollment.count({
            where: {
              courseId: course.id,
              completedAt: { not: null },
            },
          }),
          // Count unique users who viewed the course (from learning progress)
          this.prisma.learningProgress.groupBy({
            by: ['userId'],
            where: { courseId: course.id },
          }).then(result => result.length),
        ]);

        const totalEnrollments = enrollments;
        const completionRate = totalEnrollments > 0
          ? (completedEnrollments / totalEnrollments) * 100
          : 0;

        return {
          courseId: course.id,
          title: course.title,
          enrollments: totalEnrollments,
          revenue: revenue._sum?.price || 0,
          views,
          averageRating: avgRating._avg?.rating || 0,
          totalReviews,
          completionRate: Math.round(completionRate * 100) / 100,
        };
      }),
    );

    return analytics.sort((a, b) => b.enrollments - a.enrollments);
  }

  async getRevenueChartData(
    instructorId: string,
    query: { days?: number; startDate?: string; endDate?: string },
  ): Promise<RevenueChartData> {
    let startDate: Date;
    let endDate: Date;

    if (query.startDate && query.endDate) {
      startDate = new Date(query.startDate);
      endDate = new Date(query.endDate);
      // Set to start and end of day
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const days = query.days || 30;
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
    }

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        course: { instructorId },
        order: {
          status: OrderStatus.PAID,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      select: {
        order: {
          select: {
            createdAt: true,
          },
        },
        price: true,
      },
    });

    // Group by date
    const dataMap = new Map<string, { revenue: number; enrollments: number }>();
    orderItems.forEach((item) => {
      const dateKey = item.order.createdAt.toISOString().split('T')[0];
      const current = dataMap.get(dateKey) || { revenue: 0, enrollments: 0 };
      dataMap.set(dateKey, {
        revenue: current.revenue + (item.price || 0),
        enrollments: current.enrollments + 1,
      });
    });

    // Fill missing dates with 0
    const data: Array<{ date: string; revenue: number; enrollments: number }> = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayData = dataMap.get(dateKey) || { revenue: 0, enrollments: 0 };
      data.push({
        date: dateKey,
        ...dayData,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { data };
  }

  async getEnrolledStudents(
    instructorId: string,
    query: GetEnrolledStudentsQuery,
  ): Promise<GetEnrolledStudentsResponse> {
    const { page, limit, courseId, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      course: {
        instructorId,
        ...(courseId && { id: courseId }),
      },
      ...(search && {
        user: {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        },
      }),
    };

    const [enrollments, totalItems] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { enrolledAt: 'desc' },
        include: {
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
        },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    // Calculate progress for each enrollment
    const students = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalLessons = await this.prisma.lesson.count({
          where: {
            content: {
              courseId: enrollment.courseId,
            },
          },
        });

        const completedLessons = await this.prisma.learningProgress.count({
          where: {
            userId: enrollment.userId,
            courseId: enrollment.courseId,
            progressPercent: 100,
          },
        });

        const progress = totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

        return {
          userId: enrollment.user.id,
          userName: enrollment.user.name,
          userEmail: enrollment.user.email,
          userAvatar: enrollment.user.avatar,
          courseId: enrollment.course.id,
          courseTitle: enrollment.course.title,
          enrolledAt: enrollment.enrolledAt,
          progress,
          completedAt: enrollment.completedAt,
        };
      }),
    );

    return {
      data: students,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async upsertProfile(instructorId: string, body: UpdateInstructorProfileBody): Promise<InstructorProfileResponse> {
    const data = {
      title: body.title,
      bio: body.bio,
      expertise: body.expertise,
      yearsOfExperience: body.yearsOfExperience,
      websiteUrl: body.websiteUrl || null,
      linkedinUrl: body.linkedinUrl || null,
      githubUrl: body.githubUrl || null,
      youtubeUrl: body.youtubeUrl || null,
      facebookUrl: body.facebookUrl || null,
    };

    return this.prisma.instructorProfile.upsert({
      where: { userId: instructorId },
      update: data,
      create: { userId: instructorId, ...data },
    });
  }

  private async ensureOwnsCourse(courseId: string, instructorId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, title: true, thumbnail: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only access your own courses');
    }
    return course;
  }

  async getCourseDropoffAnalytics(instructorId: string, courseId: string): Promise<CourseDropoffAnalytics> {
    await this.ensureOwnsCourse(courseId, instructorId);

    const totalEnrollments = await this.prisma.enrollment.count({ where: { courseId } });

    const sections = await this.prisma.courseContent.findMany({
      where: { courseId, deletedAt: null, isActive: true },
      select: {
        orderIndex: true,
        lessons: {
          where: { deletedAt: null, isActive: true },
          select: { id: true, title: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    const orderedLessons = sections.flatMap((s) => s.lessons);

    const lessonStats = await Promise.all(
      orderedLessons.map(async (lesson) => {
        const [reached, completed] = await Promise.all([
          this.prisma.learningProgress.count({ where: { lessonId: lesson.id } }),
          this.prisma.learningProgress.count({ where: { lessonId: lesson.id, progressPercent: 100 } }),
        ]);
        return { lessonId: lesson.id, lessonTitle: lesson.title, reached, completed };
      }),
    );

    const lessons = lessonStats.map((stat, index) => {
      const nextReached = lessonStats[index + 1]?.reached ?? null;
      const dropoffRate = nextReached !== null && stat.reached > 0
        ? Math.max(0, Math.round(((stat.reached - nextReached) / stat.reached) * 100 * 100) / 100)
        : 0;

      return {
        lessonId: stat.lessonId,
        lessonTitle: stat.lessonTitle,
        reached: stat.reached,
        completed: stat.completed,
        reachRate: totalEnrollments > 0 ? Math.round((stat.reached / totalEnrollments) * 100 * 100) / 100 : 0,
        completionRate: totalEnrollments > 0 ? Math.round((stat.completed / totalEnrollments) * 100 * 100) / 100 : 0,
        dropoffRate,
      };
    });

    return { courseId, totalEnrollments, lessons };
  }

  private formatLessonDuration(seconds: number | null): string {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  private resolveLessonType(storageType: string): 'VIDEO' | 'TEXT' {
    const videoStorageTypes = new Set(['YOUTUBE', 'GOOGLE_DRIVE', 'CLOUDINARY', 'DIRECT_UPLOAD', 'CLOUDFLARE_R2']);
    return videoStorageTypes.has(storageType) ? 'VIDEO' : 'TEXT';
  }

  private calculateSectionDuration(lessons: Array<{ duration: number | null }>): string {
    const totalSeconds = lessons.reduce((sum, lesson) => sum + (lesson.duration ?? 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}p`;
    return `${minutes}p`;
  }

  async getCoursePreviewContents(instructorId: string, courseId: string): Promise<CoursePreviewContents> {
    const course = await this.ensureOwnsCourse(courseId, instructorId);

    const courseContents = await this.prisma.courseContent.findMany({
      where: { courseId, deletedAt: null, isActive: true, parentId: null },
      select: {
        id: true,
        title: true,
        orderIndex: true,
        lessons: {
          where: { deletedAt: null },
          select: { id: true, title: true, storageType: true, duration: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    const contents = courseContents.map((section) => ({
      id: section.id,
      title: section.title,
      orderIndex: section.orderIndex,
      duration: this.calculateSectionDuration(section.lessons),
      lessons: section.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        type: this.resolveLessonType(lesson.storageType as string),
        duration: this.formatLessonDuration(lesson.duration),
        isLocked: false,
      })),
    }));

    return {
      courseId: course.id,
      courseTitle: course.title,
      thumbnailUrl: course.thumbnail,
      contents,
    };
  }

  async getPreviewLessonDetail(instructorId: string, courseId: string, lessonId: string): Promise<PreviewLessonDetail> {
    await this.ensureOwnsCourse(courseId, instructorId);

    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, deletedAt: null, isActive: true, content: { courseId, deletedAt: null, isActive: true } },
      select: {
        id: true,
        title: true,
        storageType: true,
        storageUrl: true,
        contentText: true,
        transcript: true,
        duration: true,
      },
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const [resources, courseDetail] = await Promise.all([
      this.prisma.supplementaryMaterial.findMany({
        where: { lessonId },
        select: { title: true, url: true, materialType: true },
      }),
      this.prisma.courseDetail.findUnique({ where: { courseId }, select: { description: true } }),
    ]);

    return {
      id: lesson.id,
      title: lesson.title,
      type: this.resolveLessonType(lesson.storageType as string),
      storageType: lesson.storageType,
      storageUrl: lesson.storageUrl,
      contentText: lesson.contentText,
      transcript: lesson.transcript,
      duration: lesson.duration,
      description: courseDetail?.description || null,
      resources: resources.map((res) => ({ name: res.title, url: res.url, type: res.materialType || 'FILE' })),
    };
  }
}

