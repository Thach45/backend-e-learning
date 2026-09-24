import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { Prisma } from "@prisma/client";
import { GetAuditLogsQuery } from "./audit-log.model";

@Injectable()
export class AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getLogs(query: GetAuditLogsQuery) {
    const { page, limit, action, targetType, actorId } = query;
    if (page < 1 || limit < 1) {
      throw new BadRequestException("Page and limit must be positive numbers");
    }

    const where: Prisma.AuditLogWhereInput = {
      ...(action ? { action } : {}),
      ...(targetType ? { targetType } : {}),
      ...(actorId ? { actorId } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
