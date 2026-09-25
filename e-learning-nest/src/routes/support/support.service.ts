import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/shared/service/prisma.service";
import { SendEmailService } from "src/shared/service/send-email.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateTicketBody, ListTicketsQuery, UpdateTicketBody } from "./support.model";

interface Actor {
  userId: string;
  roleName?: string;
}

const MAX_TICKETS_PER_DAY = 10;
const MAX_OPEN_TICKETS = 20;
const publicUrl = () => (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

const ticketListSelect = {
  id: true,
  subject: true,
  category: true,
  status: true,
  priority: true,
  assignedToId: true,
  lastMessageAt: true,
  createdAt: true,
  closedAt: true,
  user: { select: { id: true, name: true, email: true } },
  _count: { select: { messages: true } },
} satisfies Prisma.SupportTicketSelect;

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly mail: SendEmailService,
  ) {}

  private isAdmin(a: Actor) {
    return a.roleName === "ADMIN";
  }

  // --------------------------------------------------------------- người dùng
  async create(actor: Actor, body: CreateTicketBody) {
    const since = new Date(Date.now() - 24 * 3600 * 1000);
    const [today, open] = await Promise.all([
      this.prisma.supportTicket.count({ where: { userId: actor.userId, createdAt: { gte: since } } }),
      this.prisma.supportTicket.count({ where: { userId: actor.userId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    ]);
    if (today >= MAX_TICKETS_PER_DAY) throw new BadRequestException("Bạn đã gửi quá nhiều yêu cầu hôm nay, vui lòng thử lại sau");
    if (open >= MAX_OPEN_TICKETS) throw new BadRequestException("Bạn đang có quá nhiều yêu cầu chưa xử lý xong");

    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId: actor.userId,
        subject: body.subject,
        category: body.category,
        messages: { create: { authorId: actor.userId, body: body.body, isStaff: false } },
      },
      select: { id: true, subject: true, user: { select: { name: true } } },
    });
    await this.notifyAdmins(ticket.id, "Yêu cầu hỗ trợ mới", `${ticket.user.name}: ${ticket.subject}`);
    return this.getOne(actor, ticket.id);
  }

  async listMine(actor: Actor, q: ListTicketsQuery) {
    const where: Prisma.SupportTicketWhereInput = { userId: actor.userId, ...(q.status ? { status: q.status } : {}) };
    return this.page(where, q);
  }

  async getOne(actor: Actor, id: string) {
    const t = await this.prisma.supportTicket.findUnique({
      where: { id },
      select: {
        ...ticketListSelect,
        userId: true,
        messages: { orderBy: { createdAt: "asc" }, select: { id: true, body: true, isStaff: true, createdAt: true, author: { select: { id: true, name: true, avatar: true } } } },
      },
    });
    if (!t) throw new NotFoundException("Không tìm thấy yêu cầu hỗ trợ");
    if (t.userId !== actor.userId && !this.isAdmin(actor)) throw new ForbiddenException("Bạn không có quyền xem yêu cầu này");
    const { userId, ...rest } = t;
    return rest;
  }

  /** Người dùng trả lời. Đã đóng thì không trả lời được; đã giải quyết mà người dùng nhắn tiếp thì mở lại. */
  async postMessage(actor: Actor, id: string, body: string) {
    const t = await this.prisma.supportTicket.findUnique({ where: { id }, select: { id: true, userId: true, status: true, subject: true, assignedToId: true } });
    if (!t) throw new NotFoundException("Không tìm thấy yêu cầu hỗ trợ");
    if (t.userId !== actor.userId) throw new ForbiddenException("Bạn chỉ trả lời được yêu cầu của mình");
    if (t.status === "CLOSED") throw new BadRequestException("Yêu cầu đã đóng. Hãy tạo yêu cầu mới nếu cần hỗ trợ thêm");

    await this.prisma.$transaction([
      this.prisma.ticketMessage.create({ data: { ticketId: id, authorId: actor.userId, body, isStaff: false } }),
      this.prisma.supportTicket.update({ where: { id }, data: { lastMessageAt: new Date(), ...(t.status === "RESOLVED" ? { status: "OPEN", closedAt: null } : {}) } }),
    ]);
    await this.notifyAdmins(id, "Khách hàng phản hồi", t.subject, t.assignedToId ?? undefined);
    return this.getOne(actor, id);
  }

  async close(actor: Actor, id: string) {
    const t = await this.prisma.supportTicket.findUnique({ where: { id }, select: { userId: true } });
    if (!t) throw new NotFoundException("Không tìm thấy yêu cầu hỗ trợ");
    if (t.userId !== actor.userId) throw new ForbiddenException("Bạn chỉ đóng được yêu cầu của mình");
    await this.prisma.supportTicket.update({ where: { id }, data: { status: "CLOSED", closedAt: new Date() } });
    return this.getOne(actor, id);
  }

  // -------------------------------------------------------------------- admin
  async listAdmin(q: ListTicketsQuery, actor: Actor) {
    const where: Prisma.SupportTicketWhereInput = {
      ...(q.status ? { status: q.status } : {}),
      ...(q.category ? { category: q.category } : {}),
      ...(q.assigned === "me" ? { assignedToId: actor.userId } : q.assigned === "none" ? { assignedToId: null } : {}),
      ...(q.search
        ? { OR: [{ subject: { contains: q.search, mode: "insensitive" } }, { user: { email: { contains: q.search, mode: "insensitive" } } }, { user: { name: { contains: q.search, mode: "insensitive" } } }] }
        : {}),
    };
    const [result, grouped] = await Promise.all([
      this.page(where, q, [{ priority: "desc" }, { lastMessageAt: "desc" }]),
      this.prisma.supportTicket.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);
    const counts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 } as Record<string, number>;
    for (const g of grouped) counts[g.status] = g._count._all;
    return { ...result, counts };
  }

  async reply(actor: Actor, id: string, body: string) {
    const t = await this.prisma.supportTicket.findUnique({
      where: { id },
      select: { id: true, subject: true, status: true, userId: true, user: { select: { email: true, name: true } } },
    });
    if (!t) throw new NotFoundException("Không tìm thấy yêu cầu hỗ trợ");
    if (t.status === "CLOSED") throw new BadRequestException("Yêu cầu đã đóng");

    const [msg] = await this.prisma.$transaction([
      this.prisma.ticketMessage.create({ data: { ticketId: id, authorId: actor.userId, body, isStaff: true }, select: { id: true } }),
      this.prisma.supportTicket.update({
        where: { id },
        data: { lastMessageAt: new Date(), ...(t.status === "OPEN" ? { status: "IN_PROGRESS" } : {}), assignedToId: actor.userId },
      }),
    ]);

    try {
      await this.notifications.create({
        userId: t.userId,
        type: "SYSTEM",
        title: "Đã có phản hồi cho yêu cầu hỗ trợ",
        message: `Yêu cầu "${t.subject}" vừa được trả lời.`,
        data: { kind: "support-ticket", ticketId: id },
      });
      await this.mail.sendNotice({
        to: t.user.email,
        name: t.user.name,
        subject: `Phản hồi cho yêu cầu hỗ trợ: ${t.subject}`,
        markdown: `Xin chào {{name}},\n\nĐội ngũ hỗ trợ vừa trả lời yêu cầu **${t.subject.replace(/[*\[\]]/g, "")}** của bạn.\n\n[Xem phản hồi](${publicUrl()}/support/tickets/${id})`,
        idempotencyKey: `ticket-reply-${msg.id}`,
      });
    } catch (error) {
      this.logger.warn(`Không gửi được thông báo phản hồi ticket: ${error}`);
    }
    return this.getOne(actor, id);
  }

  async update(actor: Actor, id: string, body: UpdateTicketBody) {
    const t = await this.prisma.supportTicket.findUnique({ where: { id }, select: { id: true } });
    if (!t) throw new NotFoundException("Không tìm thấy yêu cầu hỗ trợ");
    if (body.assignedToId) {
      const admin = await this.prisma.user.findFirst({ where: { id: body.assignedToId, status: "ACTIVE", userRoles: { some: { role: { name: "ADMIN" } } } }, select: { id: true } });
      if (!admin) throw new BadRequestException("Người phụ trách phải là admin đang hoạt động");
    }
    await this.prisma.supportTicket.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status, closedAt: body.status === "CLOSED" || body.status === "RESOLVED" ? new Date() : null } : {}),
        ...(body.priority ? { priority: body.priority } : {}),
        ...(body.assignedToId !== undefined ? { assignedToId: body.assignedToId } : {}),
      },
    });
    return this.getOne(actor, id);
  }

  // ------------------------------------------------------------------- nội bộ
  private async page(where: Prisma.SupportTicketWhereInput, q: ListTicketsQuery, orderBy: Prisma.SupportTicketOrderByWithRelationInput[] = [{ lastMessageAt: "desc" }]) {
    const [total, data] = await Promise.all([
      this.prisma.supportTicket.count({ where }),
      this.prisma.supportTicket.findMany({ where, select: ticketListSelect, orderBy, skip: (q.page - 1) * q.limit, take: q.limit }),
    ]);
    return { data, total, page: q.page, limit: q.limit, totalPages: Math.max(1, Math.ceil(total / q.limit)) };
  }

  private async notifyAdmins(ticketId: string, title: string, message: string, onlyAdminId?: string) {
    try {
      const admins = onlyAdminId
        ? [{ id: onlyAdminId }]
        : await this.prisma.user.findMany({ where: { status: "ACTIVE", deletedAt: null, userRoles: { some: { role: { name: "ADMIN" } } } }, select: { id: true } });
      await Promise.all(admins.map((a) => this.notifications.create({ userId: a.id, type: "SYSTEM", title, message, data: { kind: "support-ticket", ticketId } })));
    } catch (error) {
      this.logger.warn(`Không gửi được thông báo tới admin: ${error}`);
    }
  }
}
