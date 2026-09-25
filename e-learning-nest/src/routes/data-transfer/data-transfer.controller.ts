import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { GetIp } from "src/shared/decorator/get-ip.decorator";
import { Audit } from "src/shared/decorator/audit.decorator";
import { AuditLogService } from "src/shared/service/audit-log.service";
import { DataTransferService } from "./data-transfer.service";

// Nội dung CSV gửi kèm trong JSON (không cần multipart); 600KB đủ cho vài trăm dòng
class ImportBodyDto extends createZodDto(z.object({ csv: z.string().min(1).max(600_000), dryRun: z.boolean().default(true) }).strict()) {}

/** Nhập/xuất danh mục. Nằm dưới /api/admin nên PermissionGuard tự giới hạn cho ADMIN. Xuất người dùng/khoá học đã có ở admin-analytics (`export/:resource`). */
@Controller("api/admin")
export class DataTransferController {
  constructor(
    private readonly service: DataTransferService,
    private readonly audit: AuditLogService,
  ) {}

  private async send(res: Response, out: { filename: string; csv: string; rowCount?: number }, action: string, user: any, ip: string) {
    await this.audit.log({ actorId: user.userId, action, targetType: "Export", metadata: { rows: out.rowCount }, ipAddress: ip });
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${out.filename}"`);
    res.send(out.csv);
  }

  @Get("csv/categories/export")
  async categories(@ActiveUser() user: any, @GetIp() ip: string, @Res() res: Response) {
    return this.send(res, await this.service.exportCategories(), "export.categories", user, ip);
  }

  @Get("csv/categories/template")
  template(@Res() res: Response) {
    const t = this.service.importTemplate();
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${t.filename}"`);
    res.send(t.csv);
  }

  @Audit("import.categories", "Category")
  @Post("csv/categories/import")
  importCategories(@Body() body: ImportBodyDto, @ActiveUser() user: any) {
    return this.service.importCategories(body.csv, body.dryRun, user.userId);
  }
}
