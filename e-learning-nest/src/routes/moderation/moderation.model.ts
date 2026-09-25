import { z } from "zod";

export const ReportTargetTypeSchema = z.enum(["COMMENT", "LESSON_QUESTION", "LESSON_ANSWER", "REVIEW"]);
export const ReportReasonSchema = z.enum(["SPAM", "INAPPROPRIATE", "HARASSMENT", "MISLEADING", "OTHER"]);
export const ReportStatusSchema = z.enum(["PENDING", "RESOLVED", "DISMISSED"]);

// User gửi báo cáo
export const CreateReportBodySchema = z.object({
  targetType: ReportTargetTypeSchema,
  targetId: z.string().uuid(),
  reason: ReportReasonSchema,
  details: z.string().trim().max(500).optional(),
}).strict();

export const GetReportsQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  status: ReportStatusSchema.optional(),
  targetType: ReportTargetTypeSchema.optional(),
}).strict();

export const ReportParamsSchema = z.object({
  id: z.string().uuid(),
}).strict();

// REMOVE_CONTENT: gỡ nội dung vi phạm, DISMISS: báo cáo không đúng, giữ nội dung
export const ResolveReportBodySchema = z.object({
  action: z.enum(["REMOVE_CONTENT", "DISMISS"]),
  note: z.string().trim().max(500).optional(),
}).strict();

export const ModerationListQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  search: z.string().trim().optional(),
  // Chỉ dùng cho danh sách hỏi đáp
  resolved: z.enum(["true", "false"]).optional(),
}).strict();

export type CreateReportBody = z.infer<typeof CreateReportBodySchema>;
export type GetReportsQuery = z.infer<typeof GetReportsQuerySchema>;
export type ResolveReportBody = z.infer<typeof ResolveReportBodySchema>;
export type ModerationListQuery = z.infer<typeof ModerationListQuerySchema>;
export type ReportTargetType = z.infer<typeof ReportTargetTypeSchema>;
