import { z } from "zod";

export const AuditLogEntrySchema = z.object({
  id: z.string().uuid(),
  actorId: z.string().uuid().nullable().optional(),
  actor: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
    })
    .nullable()
    .optional(),
  action: z.string(),
  targetType: z.string().nullable().optional(),
  targetId: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  createdAt: z.date(),
}).strict();

export const GetAuditLogsQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  action: z.string().optional(),
  targetType: z.string().optional(),
  actorId: z.string().uuid().optional(),
}).strict();

export const GetAuditLogsResponseSchema = z.object({
  data: z.array(AuditLogEntrySchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
}).strict();

export type GetAuditLogsQuery = z.infer<typeof GetAuditLogsQuerySchema>;
export type GetAuditLogsResponse = z.infer<typeof GetAuditLogsResponseSchema>;
