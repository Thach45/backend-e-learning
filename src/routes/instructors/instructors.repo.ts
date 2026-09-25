import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { ROLES } from "@prisma/client";
import { FollowInstructorResponse, PublicInstructorProfile } from "./instructors.model";

@Injectable()
export class InstructorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicProfile(instructorId: string, viewerUserId?: string): Promise<PublicInstructorProfile> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: instructorId,
        deletedAt: null,
        userRoles: { some: { role: { name: ROLES.INSTRUCTOR } } },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        instructorProfile: true,
      },
    });
    if (!user) {
      throw new NotFoundException("Instructor not found");
    }

    const courses = await this.prisma.course.findMany({
      where: { instructorId, status: "PUBLISHED", deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        price: true,
        salePrice: true,
        level: true,
      },
    });
    const courseIds = courses.map((c) => c.id);

    const [reviewAgg, enrollmentCounts, reviewCounts, followerCount, myFollow] = await Promise.all([
      this.prisma.review.aggregate({
        _avg: { rating: true },
        where: { courseId: { in: courseIds } },
      }),
      this.prisma.enrollment.groupBy({
        by: ["courseId"],
        where: { courseId: { in: courseIds } },
        _count: { _all: true },
      }),
      this.prisma.review.groupBy({
        by: ["courseId"],
        where: { courseId: { in: courseIds } },
        _count: { _all: true },
      }),
      this.prisma.instructorFollow.count({ where: { instructorId } }),
      viewerUserId
        ? this.prisma.instructorFollow.findUnique({
            where: { instructorId_followerId: { instructorId, followerId: viewerUserId } },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    const learnersMap = new Map(enrollmentCounts.map((r) => [r.courseId, r._count._all]));
    const reviewCountMap = new Map(reviewCounts.map((r) => [r.courseId, r._count._all]));

    const totalStudents = enrollmentCounts.reduce((sum, r) => sum + r._count._all, 0);

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      title: user.instructorProfile?.title ?? null,
      bio: user.instructorProfile?.bio ?? null,
      expertise: user.instructorProfile?.expertise ?? [],
      yearsOfExperience: user.instructorProfile?.yearsOfExperience ?? null,
      websiteUrl: user.instructorProfile?.websiteUrl ?? null,
      linkedinUrl: user.instructorProfile?.linkedinUrl ?? null,
      githubUrl: user.instructorProfile?.githubUrl ?? null,
      youtubeUrl: user.instructorProfile?.youtubeUrl ?? null,
      facebookUrl: user.instructorProfile?.facebookUrl ?? null,
      totalCourses: courses.length,
      totalStudents,
      averageRating: reviewAgg._avg.rating ?? 0,
      followerCount,
      isFollowing: viewerUserId ? !!myFollow : undefined,
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        thumbnail: c.thumbnail,
        price: c.price,
        salePrice: c.salePrice,
        level: c.level,
        totalLearners: learnersMap.get(c.id) ?? 0,
        reviewsCount: reviewCountMap.get(c.id) ?? 0,
      })),
    };
  }

  private async ensureInstructorExists(instructorId: string) {
    const instructor = await this.prisma.user.findFirst({
      where: {
        id: instructorId,
        deletedAt: null,
        userRoles: { some: { role: { name: ROLES.INSTRUCTOR } } },
      },
      select: { id: true },
    });
    if (!instructor) {
      throw new NotFoundException("Instructor not found");
    }
  }

  async follow(instructorId: string, followerId: string): Promise<FollowInstructorResponse> {
    await this.ensureInstructorExists(instructorId);
    if (instructorId === followerId) {
      throw new NotFoundException("Instructor not found");
    }
    await this.prisma.instructorFollow.upsert({
      where: { instructorId_followerId: { instructorId, followerId } },
      update: {},
      create: { instructorId, followerId },
    });
    const followerCount = await this.prisma.instructorFollow.count({ where: { instructorId } });
    return { following: true, followerCount };
  }

  async unfollow(instructorId: string, followerId: string): Promise<FollowInstructorResponse> {
    await this.ensureInstructorExists(instructorId);
    await this.prisma.instructorFollow.deleteMany({ where: { instructorId, followerId } });
    const followerCount = await this.prisma.instructorFollow.count({ where: { instructorId } });
    return { following: false, followerCount };
  }

  async getFollowStatus(instructorId: string, followerId: string) {
    const existing = await this.prisma.instructorFollow.findUnique({
      where: { instructorId_followerId: { instructorId, followerId } },
      select: { id: true },
    });
    return { following: !!existing };
  }
}
