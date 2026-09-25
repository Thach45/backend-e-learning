import { Controller, Get, Query } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { AuditLogReadService } from "./audit-log.service";
import { GetAuditLogsQueryDto, GetAuditLogsResponseDto } from "./audit-log.dto";

@Controller("api/admin/audit-logs")
export class AuditLogController {
  constructor(private readonly auditLogReadService: AuditLogReadService) {}

  @Get()
  @ZodSerializerDto(GetAuditLogsResponseDto)
  async getLogs(@Query() query: GetAuditLogsQueryDto) {
    return this.auditLogReadService.getLogs(query as any);
  }
}
