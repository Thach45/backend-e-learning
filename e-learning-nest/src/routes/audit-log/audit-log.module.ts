import { Module } from "@nestjs/common";
import { AuditLogController } from "./audit-log.controller";
import { AuditLogReadService } from "./audit-log.service";
import { AuditLogRepository } from "./audit-log.repo";
import { SharedModule } from "src/shared/shared.module";

@Module({
  imports: [SharedModule],
  controllers: [AuditLogController],
  providers: [AuditLogReadService, AuditLogRepository],
})
export class AuditLogModule {}
