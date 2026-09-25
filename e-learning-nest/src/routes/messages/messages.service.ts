import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";

export const RATE_LIMIT_MESSAGES = 20;
export const RATE_LIMIT_WINDOW_MS = 10 * 60_000;

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Có quan hệ giảng dạy: `studentId` đã ghi danh ít nhất một khoá còn hiệu lực của `instructorId`. */
  private async isTeaching(instructorId: string, studentId: string) {
    const n = await this.prisma.enrollment.count({ where: { userId: studentId, course: { instructorId, deletedAt: null } } });
    return n > 0;
  }

  private async participant(conversationId: string, userId: string) {
    const c = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    // Người ngoài cuộc nhận 404 để không dò được sự tồn tại của cuộc trò chuyện
    if (!c || (c.studentId !== userId && c.instructorId !== userId)) throw new NotFoundException("Không tìm thấy cuộc trò chuyện.");
    return c;
  }

  private async checkRate(senderId: string) {
    const recent = await this.prisma.message.count({ where: { senderId, createdAt: { gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS) } } });
    if (recent >= RATE_LIMIT_MESSAGES) throw new HttpException("Bạn gửi tin nhắn quá nhanh, hãy thử lại sau ít phút.", HttpStatus.TOO_MANY_REQUESTS);
  }

  async list(userId: string) {
    const rows = await this.prisma.conversation.findMany({
      where: { OR: [{ studentId: userId }, { instructorId: userId }] },
      orderBy: { lastMessageAt: "desc" },
      take: 50,
      select: {
        id: true, lastMessageAt: true, blockedById: true, studentId: true,
        student: { select: { id: true, name: true, avatar: true } },
        instructor: { select: { id: true, name: true, avatar: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, senderId: true, createdAt: true } },
      },
    });
    const unread = await this.prisma.message.groupBy({ by: ["conversationId"], where: { conversationId: { in: rows.map((r) => r.id) }, senderId: { not: userId }, readAt: null }, _count: { _all: true } });
    const unreadBy = new Map(unread.map((u) => [u.conversationId, u._count._all]));
    return rows.map((r) => {
      const other = r.studentId === userId ? r.instructor : r.student;
      const last = r.messages[0];
      return {
        id: r.id,
        other,
        lastMessage: last ? { preview: last.body.slice(0, 100), mine: last.senderId === userId, createdAt: last.createdAt } : null,
        unread: unreadBy.get(r.id) ?? 0,
        blocked: !!r.blockedById,
        blockedByMe: r.blockedById === userId,
        lastMessageAt: r.lastMessageAt,
      };
    });
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.message.count({ where: { senderId: { not: userId }, readAt: null, conversation: { OR: [{ studentId: userId }, { instructorId: userId }] } } });
    return { count };
  }

  /** Những người có thể bắt đầu nhắn: giảng viên của các khoá bạn đã ghi danh, hoặc học viên trong khoá của bạn. */
  async contacts(userId: string, search?: string) {
    const nameFilter = search ? { name: { contains: search, mode: "insensitive" as const } } : {};
    const [instructors, students] = await Promise.all([
      this.prisma.user.findMany({ where: { ...nameFilter, deletedAt: null, status: "ACTIVE", instructorCourses: { some: { deletedAt: null, enrollments: { some: { userId } } } } }, take: 50, orderBy: { name: "asc" }, select: { id: true, name: true, avatar: true } }),
      this.prisma.user.findMany({ where: { ...nameFilter, deletedAt: null, status: "ACTIVE", NOT: { id: userId }, enrollments: { some: { course: { instructorId: userId, deletedAt: null } } } }, take: 50, orderBy: { name: "asc" }, select: { id: true, name: true, avatar: true } }),
    ]);
    return { instructors, students };
  }

  /** Bắt đầu (hoặc tiếp tục) cuộc trò chuyện với `toUserId`. Chỉ được khi giữa hai người có quan hệ ghi danh. */
  async start(senderId: string, toUserId: string, body: string) {
    if (toUserId === senderId) throw new BadRequestException("Không thể nhắn cho chính mình.");
    const other = await this.prisma.user.findFirst({ where: { id: toUserId, deletedAt: null, status: "ACTIVE" }, select: { id: true } });
    if (!other) throw new NotFoundException("Không tìm thấy người nhận.");

    let convo = await this.prisma.conversation.findFirst({
      where: { OR: [{ studentId: senderId, instructorId: toUserId }, { studentId: toUserId, instructorId: senderId }] },
    });
    if (!convo) {
      let studentId: string | null = null;
      if (await this.isTeaching(toUserId, senderId)) studentId = senderId; // tôi là học viên của họ
      else if (await this.isTeaching(senderId, toUserId)) studentId = toUserId; // họ là học viên của tôi
      if (!studentId) throw new ForbiddenException("Chỉ nhắn được cho giảng viên của khoá bạn đã ghi danh hoặc học viên của bạn.");
      convo = await this.prisma.conversation.create({ data: { studentId, instructorId: studentId === senderId ? toUserId : senderId } });
    }
    return this.send(convo.id, senderId, body);
  }

  async send(conversationId: string, senderId: string, body: string) {
    const convo = await this.participant(conversationId, senderId);
    if (convo.blockedById) throw new ForbiddenException(convo.blockedById === senderId ? "Bạn đã chặn cuộc trò chuyện này. Hãy bỏ chặn để nhắn tiếp." : "Bạn không thể gửi tin nhắn trong cuộc trò chuyện này.");
    await this.checkRate(senderId);
    const recipientId = convo.studentId === senderId ? convo.instructorId : convo.studentId;
    // Chỉ báo chuông khi người nhận chưa có tin chưa đọc nào từ người gửi, tránh dồn dập
    const alreadyUnread = await this.prisma.message.count({ where: { conversationId, senderId, readAt: null } });
    const [msg] = await this.prisma.$transaction([
      this.prisma.message.create({ data: { conversationId, senderId, body }, select: { id: true, senderId: true, body: true, createdAt: true, readAt: true } }),
      this.prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } }),
    ]);
    if (alreadyUnread === 0) {
      try {
        const sender = await this.prisma.user.findUnique({ where: { id: senderId }, select: { name: true } });
        await this.notifications.create({ userId: recipientId, type: "SYSTEM", title: "Tin nhắn mới", message: `${sender?.name ?? "Ai đó"} vừa nhắn cho bạn.`, data: { kind: "message", conversationId } });
      } catch (e) {
        this.logger.warn(`Không tạo được thông báo tin nhắn: ${e}`);
      }
    }
    return { conversationId, message: msg };
  }

  /** Trả tin theo thứ tự cũ → mới; `before` để nạp thêm tin cũ hơn. */
  async messages(conversationId: string, userId: string, before: Date | undefined, limit: number) {
    await this.participant(conversationId, userId);
    const rows = await this.prisma.message.findMany({ where: { conversationId, ...(before ? { createdAt: { lt: before } } : {}) }, orderBy: { createdAt: "desc" }, take: limit + 1, select: { id: true, senderId: true, body: true, createdAt: true, readAt: true } });
    const hasMore = rows.length > limit;
    return { messages: rows.slice(0, limit).reverse().map((m) => ({ ...m, mine: m.senderId === userId })), hasMore };
  }

  async markRead(conversationId: string, userId: string) {
    await this.participant(conversationId, userId);
    const res = await this.prisma.message.updateMany({ where: { conversationId, senderId: { not: userId }, readAt: null }, data: { readAt: new Date() } });
    return { read: res.count };
  }

  async setBlocked(conversationId: string, userId: string, blocked: boolean) {
    const convo = await this.participant(conversationId, userId);
    if (blocked) {
      if (convo.blockedById && convo.blockedById !== userId) throw new ForbiddenException("Cuộc trò chuyện đã bị chặn bởi bên kia.");
      await this.prisma.conversation.update({ where: { id: conversationId }, data: { blockedById: userId } });
    } else {
      if (convo.blockedById !== userId) throw new ForbiddenException("Chỉ người đã chặn mới bỏ chặn được.");
      await this.prisma.conversation.update({ where: { id: conversationId }, data: { blockedById: null } });
    }
    return { blocked };
  }
}
