import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { GetIp } from "src/shared/decorator/get-ip.decorator";
import { AuditLogService } from "src/shared/service/audit-log.service";
import { AdminAnalyticsService } from "./admin-analytics.service";
import { AdminExportService } from "./admin-export.service";
import {
  CourseAnalyticsQueryDto,
  ExportParamsDto,
  ExportQueryDto,
  InstructorAnalyticsQueryDto,
} from "./admin-analytics.dto";

@Controller("api/admin")
export class AdminAnalyticsController {
  constructor(
    private readonly analyticsService: AdminAnalyticsService,
    private readonly exportService: AdminExportService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get("analytics/overview")
  async getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get("analytics/courses")
  async getCourseAnalytics(@Query() query: CourseAnalyticsQueryDto) {
    return this.analyticsService.getCourseAnalytics(query as any);
  }

  @Get("analytics/instructors")
  async getInstructorAnalytics(@Query() query: InstructorAnalyticsQueryDto) {
    return this.analyticsService.getInstructorAnalytics(query as any);
  }

  // Trả file trực tiếp (không đi qua TransformInterceptor) nên dùng @Res()
  @Get("export/:resource")
  async exportCsv(
    @Param() params: ExportParamsDto,
    @Query() query: ExportQueryDto,
    @ActiveUser() user: any,
    @GetIp() ip: string,
    @Res() res: Response,
  ) {
    const resource = (params as any).resource;
    const { filename, csv } = await this.exportService.export(resource, query as any);

    // Xuất dữ liệu cá nhân là hành động nhạy cảm nên phải để lại dấu vết
    await this.auditLogService.log({
      actorId: user.userId,
      action: "export.csv",
      targetType: "Export",
      targetId: resource,
      metadata: { filters: query },
      ipAddress: ip,
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  }
}
