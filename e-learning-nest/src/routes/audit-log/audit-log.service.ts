import { Injectable } from "@nestjs/common";
import { AuditLogRepository } from "./audit-log.repo";
import { GetAuditLogsQuery } from "./audit-log.model";

@Injectable()
export class AuditLogReadService {
  constructor(private readonly repo: AuditLogRepository) {}

  async getLogs(query: GetAuditLogsQuery) {
    return this.repo.getLogs(query);
  }
}
