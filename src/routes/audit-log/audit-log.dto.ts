import { createZodDto } from "nestjs-zod";
import { GetAuditLogsQuerySchema, GetAuditLogsResponseSchema } from "./audit-log.model";

export class GetAuditLogsQueryDto extends createZodDto(GetAuditLogsQuerySchema) {}
export class GetAuditLogsResponseDto extends createZodDto(GetAuditLogsResponseSchema) {}
