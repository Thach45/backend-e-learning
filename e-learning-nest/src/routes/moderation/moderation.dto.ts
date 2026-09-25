import { createZodDto } from "nestjs-zod";
import {
  CreateReportBodySchema,
  GetReportsQuerySchema,
  ReportParamsSchema,
  ResolveReportBodySchema,
  ModerationListQuerySchema,
} from "./moderation.model";

export class CreateReportBodyDto extends createZodDto(CreateReportBodySchema) {}
export class GetReportsQueryDto extends createZodDto(GetReportsQuerySchema) {}
export class ReportParamsDto extends createZodDto(ReportParamsSchema) {}
export class ResolveReportBodyDto extends createZodDto(ResolveReportBodySchema) {}
export class ModerationListQueryDto extends createZodDto(ModerationListQuerySchema) {}
