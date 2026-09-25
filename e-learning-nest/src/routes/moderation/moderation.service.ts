import { ConflictException, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { ReportStatus } from "@prisma/client";
import { AuditLogService } from "src/shared/service/audit-log.service";
import { ModerationRepo } from "./moderation.repo";
import {
  CreateReportBody,
  GetReportsQuery,
  ModerationListQuery,
  ReportTargetType,
  ResolveReportBody,
} from "./moderation.model";

@Injectable()
export class ModerationService {
  constructor(
    private readonly repo: ModerationRepo,
    private readonly auditLogService: AuditLogService,
  ) {}

  // ===== Người dùng gửi báo cáo =====
  async createReport(body: CreateReportBody, reporterId: string) {
    const target = await this.repo.getTargetInfo(body.targetType, body.targetId);
    if (!target) throw new NotFoundException("Nội dung không tồn tại hoặc đã bị gỡ");
    if (target.authorId === reporterId) {
      throw new BadRequestException("Bạn không thể báo cáo nội dung của chính mình");
    }
    if (await this.repo.findExistingReport(reporterId, body.targetType, body.targetId)) {
      throw new ConflictException("Bạn đã báo cáo nội dung này rồi");
    }

    await this.repo.createReport({
      reporterId,
      targetType: body.targetType,
      targetId: body.targetId,
      reason: body.reason,
      details: body.details,
      targetAuthorId: target.authorId,
      contentSnapshot: target.snapshot.slice(0, 2000),
      targetContext: target.context,
    });
    return { success: true };
  }

  // ===== Admin: xử lý báo cáo =====
  async getReports(query: GetReportsQuery) {
    return this.repo.getReports(query);
  }

  async getPendingCount() {
    return { pending: await this.repo.getPendingCount() };
  }

  async resolveReport(id: string, body: ResolveReportBody, adminId: string, ip?: string) {
    const report = await this.repo.getReportById(id);
    if (report.status !== ReportStatus.PENDING) {
      throw new BadRequestException("Báo cáo này đã được xử lý");
    }

    const remove = body.action === "REMOVE_CONTENT";
    const removed = remove ? await this.repo.removeTarget(report.targetType, report.targetId) : false;

    // Nội dung có thể đã bị xóa từ trước: vẫn coi báo cáo là đã xử lý.
    const result = await this.repo.closePendingReportsForTarget(report.targetType, report.targetId, {
      status: remove ? ReportStatus.RESOLVED : ReportStatus.DISMISSED,
      handledById: adminId,
      resolutionNote: body.note,
      contentRemoved: removed,
    });

    await this.auditLogService.log({
      actorId: adminId,
      action: remove ? "report.remove_content" : "report.dismiss",
      targetType: report.targetType,
      targetId: report.targetId,
      metadata: {
        reportId: id,
        reportsClosed: result.count,
        authorId: report.targetAuthorId,
        note: body.note,
        contentSnapshot: report.contentSnapshot?.slice(0, 200),
      },
      ipAddress: ip,
    });

    return { success: true, contentRemoved: removed, reportsClosed: result.count };
  }

  // ===== Admin: kiểm duyệt trực tiếp =====
  async listComments(query: ModerationListQuery) {
    return this.repo.listComments(query);
  }

  async listQuestions(query: ModerationListQuery) {
    return this.repo.listQuestions(query);
  }

  async removeContent(targetType: ReportTargetType, targetId: string, adminId: string, ip?: string) {
    const info = await this.repo.getTargetInfo(targetType, targetId);
    if (!info) throw new NotFoundException("Nội dung không tồn tại");

    await this.repo.removeTarget(targetType, targetId);
    // Báo cáo đang chờ của nội dung này coi như đã xử lý
    await this.repo.closePendingReportsForTarget(targetType, targetId, {
      status: ReportStatus.RESOLVED,
      handledById: adminId,
      resolutionNote: "Admin gỡ nội dung trực tiếp",
      contentRemoved: true,
    });

    await this.auditLogService.log({
      actorId: adminId,
      action: "moderation.remove_content",
      targetType,
      targetId,
      metadata: { authorId: info.authorId, context: info.context, contentSnapshot: info.snapshot.slice(0, 200) },
      ipAddress: ip,
    });
    return { success: true };
  }
}
