import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { Prisma } from "@prisma/client";
import { CreateNotificationInput, GetNotificationsQuery } from "./notifications.model";

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateNotificationInput) {
    return this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        data: (input.data ?? undefined) as Prisma.InputJsonValue | undefined,
        courseId: input.courseId,
        lessonId: input.lessonId,
        orderId: input.orderId,
        commentId: input.commentId,
      },
    });
  }

  async getNotifications(query: GetNotificationsQuery, userId: string) {
    const { page, limit, status } = query;
    if (page < 1 || limit < 1) {
      throw new Error("Page and limit must be positive numbers");
    }

    const where: Prisma.NotificationWhereInput = {
      userId,
      deletedAt: null,
      ...(status ? { status } : {}),
    };

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, status: "UNREAD", deletedAt: null },
      }),
    ]);

    return { data, total, unreadCount, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUnreadCount(userId: string) {
    const unreadCount = await this.prisma.notification.count({
      where: { userId, status: "UNREAD", deletedAt: null },
    });
    return { unreadCount };
  }

  async markAsRead(id: string, userId: string) {
    const existing = await this.prisma.notification.findFirst({
      where: { id, userId, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException("Notification not found");
    }
    await this.prisma.notification.update({
      where: { id },
      data: { status: "READ", readAt: new Date() },
    });
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, status: "UNREAD", deletedAt: null },
      data: { status: "READ", readAt: new Date() },
    });
    return { success: true };
  }
}
