import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { GetIp } from "src/shared/decorator/get-ip.decorator";
import { AuditLogService } from "src/shared/service/audit-log.service";
import { InstructorStudentsService } from "./instructor-students.service";

class ExportQueryDto extends createZodDto(
  z.object({ courseId: z.string().uuid().optional(), search: z.string().trim().max(100).optional() }),
) {}
class ProgressParamsDto extends createZodDto(z.object({ courseId: z.string().uuid(), userId: z.string().uuid() }).strict()) {}

@Controller("api")
export class InstructorStudentsController {
  constructor(
    private readonly service: InstructorStudentsService,
    private readonly audit: AuditLogService,
  ) {}

  /** Trả file trực tiếp (không đi qua TransformInterceptor). Xuất dữ liệu cá nhân nên có ghi nhật ký. */
  @Get("instructor/students/export")
  async exportCsv(@Query() q: ExportQueryDto, @ActiveUser() user: any, @GetIp() ip: string, @Res() res: Response) {
    const { filename, csv, rowCount } = await this.service.exportCsv(user, q);
    await this.audit.log({
      actorId: user.userId,
      action: "instructor.students.export",
      targetType: "Course",
      targetId: q.courseId,
      metadata: { rows: rowCount },
      ipAddress: ip,
    });
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get("instructor/courses/:courseId/students/:userId/progress")
  studentProgress(@Param() p: ProgressParamsDto, @ActiveUser() user: any) {
    return this.service.studentProgress(user, p.courseId, p.userId);
  }
}
