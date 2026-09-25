import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

export type AuditLogEntry = {
  actorId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
};

/**
 * Ghi log các hành động nhạy cảm (duyệt/từ chối khóa học, khóa/xóa tài khoản, đổi quyền...).
 * Không bao giờ được để lỗi ghi log làm hỏng luồng nghiệp vụ gọi tới đây.
 */
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: entry.actorId,
          action: entry.action,
          targetType: entry.targetType,
          targetId: entry.targetId,
          metadata: entry.metadata as any,
          ipAddress: entry.ipAddress,
        },
      });
    } catch (error) {
      this.logger.warn(`Không thể ghi audit log (${entry.action}): ${error}`);
    }
  }
}
