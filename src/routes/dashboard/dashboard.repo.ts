import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/service/prisma.service';
import { OrderStatus } from '@prisma/client';
import type {
  OverviewStats,
  RevenueStats,
  UserStats,
  CourseStats,
  DocumentStats,
  ChartData,
} from './dashboard.model';

@Injectable()
export class DashboardRepo {
  constructor(private readonly prisma: PrismaService) {}

  async getOverviewStats(): Promise<OverviewStats> {
    const [
      totalUsers,
      totalCourses,
      totalDocuments,
      totalOrders,
      activeUsers,
      publishedCourses,
      verifiedDocuments,
      pendingOrders,
      revenueResult,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.supplementaryMaterial.count({
        where: {
          uploaderId: { not: null },
          lessonId: null,
          courseId: null,
        },
      }),
      this.prisma.order.count(),
      this.prisma.user.count({
        where: {
          status: 'ACTIVE',
        },
      }),
      this.prisma.course.count({
        where: {
          status: 'PUBLISHED',
        },
      }),
      this.prisma.materialDetail.count({
        where: {
          isVerified: true,
          material: {
            uploaderId: { not: null },
            lessonId: null,
            courseId: null,
          },
        },
      }),
      this.prisma.order.count({
        where: {
          status: 'PENDING',
        },
      }),
      this.prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          status: OrderStatus.PAID,
        },
      }),
    ]);

    return {
      totalUsers,
      totalCourses,
      totalDocuments,
      totalOrders,
      totalRevenue: revenueResult._sum?.totalAmount || 0,
      activeUsers,
      publishedCourses,
      verifiedDocuments,
      pendingOrders,
    };
  }

  async getRevenueStats(): Promise<RevenueStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue,
      dailyRevenue,
      lastMonthRevenue,
      topCoursesData,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: OrderStatus.PAID },
      }),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: OrderStatus.PAID,
          createdAt: { gte: startOfMonth },
        },
      }),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: OrderStatus.PAID,
          createdAt: { gte: startOfWeek },
        },
      }),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: OrderStatus.PAID,
          createdAt: { gte: startOfDay },
        },
      }),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: OrderStatus.PAID,
          createdAt: { gte: lastMonth, lte: endOfLastMonth },
        },
      }),
      this.prisma.orderItem.groupBy({
        by: ['courseId'],
        where: {
          order: { status: OrderStatus.PAID },
        },
        _sum: {
          price: true,
        },
        _count: {
          _all: true,
        },
        orderBy: {
          _sum: {
            price: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    const topCourses = await Promise.all(
      topCoursesData.map(async (item) => {
        const course = await this.prisma.course.findUnique({
          where: { id: item.courseId },
          select: { title: true },
        });
        return {
          courseId: item.courseId,
          courseTitle: course?.title || 'Unknown',
          revenue: item._sum?.price || 0,
          enrollments: item._count?._all || 0,
        };
      }),
    );

    const currentMonth = monthlyRevenue._sum?.totalAmount || 0;
    const previousMonth = lastMonthRevenue._sum?.totalAmount || 0;
    const revenueGrowth = previousMonth > 0
      ? ((currentMonth - previousMonth) / previousMonth) * 100
      : currentMonth > 0 ? 100 : 0;

    return {
      totalRevenue: totalRevenue._sum?.totalAmount || 0,
      monthlyRevenue: currentMonth,
      weeklyRevenue: weeklyRevenue._sum?.totalAmount || 0,
      dailyRevenue: dailyRevenue._sum?.totalAmount || 0,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      topCourses,
    };
  }

  async getUserStats(): Promise<UserStats> {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeUsers,
      lastMonthUsers,
      usersByRoleData,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: startOfDay } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: startOfWeek } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.user.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: lastMonth, lte: endOfLastMonth },
        },
      }),
      this.prisma.userRole.groupBy({
        by: ['roleId'],
        _count: { userId: true },
      }),
    ]);

    const usersByRole = await Promise.all(
      usersByRoleData.map(async (item) => {
        const role = await this.prisma.role.findUnique({
          where: { id: item.roleId },
          select: { name: true },
        });
        return {
          roleName: role?.name || 'Unknown',
          count: item._count.userId,
        };
      }),
    );

    const currentMonth = newUsersThisMonth;
    const previousMonth = lastMonthUsers;
    const userGrowth = previousMonth > 0
      ? ((currentMonth - previousMonth) / previousMonth) * 100
      : currentMonth > 0 ? 100 : 0;

    return {
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeUsers,
      userGrowth: Math.round(userGrowth * 100) / 100,
      usersByRole,
    };
  }

  async getCourseStats(): Promise<CourseStats> {
    const [
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      averageRatingResult,
      topCoursesData,
    ] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.course.count({
        where: { status: 'PUBLISHED' },
      }),
      this.prisma.course.count({
        where: { status: 'DRAFT' },
      }),
      this.prisma.enrollment.count(),
      this.prisma.review.aggregate({
        _avg: { rating: true },
      }),
      this.prisma.enrollment.groupBy({
        by: ['courseId'],
        _count: { courseId: true },
        orderBy: {
          _count: {
            courseId: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    const topCourses = await Promise.all(
      topCoursesData.map(async (item) => {
        const course = await this.prisma.course.findUnique({
          where: { id: item.courseId },
          select: { title: true },
        });
        const avgRating = await this.prisma.review.aggregate({
          where: { courseId: item.courseId },
          _avg: { rating: true },
        });
        const revenue = await this.prisma.orderItem.aggregate({
          where: {
            courseId: item.courseId,
            order: { status: OrderStatus.PAID },
          },
          _sum: { price: true },
        });
        return {
          courseId: item.courseId,
          title: course?.title || 'Unknown',
          enrollments: item._count.courseId,
          revenue: revenue._sum?.price || 0,
          rating: avgRating._avg.rating || 0,
        };
      }),
    );

    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      averageRating: averageRatingResult._avg.rating || 0,
      topCourses,
    };
  }

  async getDocumentStats(): Promise<DocumentStats> {
    const [
      totalDocuments,
      verifiedDocuments,
      totalViews,
      totalDownloads,
      totalLikes,
      topDocumentsData,
      topTagsData,
    ] = await Promise.all([
      this.prisma.supplementaryMaterial.count({
        where: {
          uploaderId: { not: null },
          lessonId: null,
          courseId: null,
        },
      }),
      this.prisma.materialDetail.count({
        where: {
          isVerified: true,
          material: {
            uploaderId: { not: null },
            lessonId: null,
            courseId: null,
          },
        },
      }),
      this.prisma.materialDetail.aggregate({
        where: {
          material: {
            uploaderId: { not: null },
            lessonId: null,
            courseId: null,
          },
        },
        _sum: { totalView: true },
      }),
      this.prisma.materialDetail.aggregate({
        where: {
          material: {
            uploaderId: { not: null },
            lessonId: null,
            courseId: null,
          },
        },
        _sum: { totalDownload: true },
      }),
      this.prisma.materialDetail.aggregate({
        where: {
          material: {
            uploaderId: { not: null },
            lessonId: null,
            courseId: null,
          },
        },
        _sum: { totalLike: true },
      }),
      this.prisma.materialDetail.findMany({
        where: {
          material: {
            uploaderId: { not: null },
            lessonId: null,
            courseId: null,
          },
        },
        orderBy: [
          { totalView: 'desc' },
          { totalDownload: 'desc' },
        ],
        take: 5,
        include: {
          material: {
            select: { id: true, title: true },
          },
        },
      }),
      this.prisma.documentTag.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { materials: true },
          },
        },
        take: 5,
      }),
    ]);

    const topDocuments = topDocumentsData.map((doc) => ({
      documentId: doc.material.id,
      title: doc.material.title,
      views: doc.totalView,
      downloads: doc.totalDownload,
      likes: doc.totalLike,
    }));

    const topTags = topTagsData
      .map((tag) => ({
        tagId: tag.id,
        tagName: tag.name,
        documentCount: tag._count.materials,
      }))
      .sort((a, b) => b.documentCount - a.documentCount)
      .slice(0, 5);

    return {
      totalDocuments,
      verifiedDocuments,
      totalViews: totalViews._sum.totalView || 0,
      totalDownloads: totalDownloads._sum.totalDownload || 0,
      totalLikes: totalLikes._sum.totalLike || 0,
      topDocuments,
      topTags,
    };
  }

  async getRevenueChartData(days = 30): Promise<ChartData> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PAID,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    // Group by date
    const dataMap = new Map<string, number>();
    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const current = dataMap.get(dateKey) || 0;
      dataMap.set(dateKey, current + (order.totalAmount || 0));
    });

    // Fill missing dates with 0
    const data: Array<{ date: string; value: number }> = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      data.push({
        date: dateKey,
        value: dataMap.get(dateKey) || 0,
      });
    }

    return { data };
  }

  async getUserChartData(days = 30): Promise<ChartData> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const users = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by date
    const dataMap = new Map<string, number>();
    users.forEach((user) => {
      const dateKey = user.createdAt.toISOString().split('T')[0];
      const current = dataMap.get(dateKey) || 0;
      dataMap.set(dateKey, current + 1);
    });

    // Fill missing dates with 0
    const data: Array<{ date: string; value: number }> = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      data.push({
        date: dateKey,
        value: dataMap.get(dateKey) || 0,
      });
    }

    return { data };
  }
}

