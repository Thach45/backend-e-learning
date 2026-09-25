import { z } from "zod";

export const TicketCategoryEnum = z.enum(["ACCOUNT", "PAYMENT", "COURSE", "TECHNICAL", "OTHER"]);
export const TicketStatusEnum = z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]);
export const TicketPriorityEnum = z.enum(["LOW", "NORMAL", "HIGH"]);

export const IdParamsSchema = z.object({ id: z.string().uuid() }).strict();

export const CreateTicketBodySchema = z
  .object({
    subject: z.string().trim().min(3).max(200),
    category: TicketCategoryEnum.default("OTHER"),
    body: z.string().trim().min(5).max(10000),
  })
  .strict();

export const PostMessageBodySchema = z.object({ body: z.string().trim().min(1).max(10000) }).strict();

export const ListTicketsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: TicketStatusEnum.optional(),
  category: TicketCategoryEnum.optional(),
  /** Chỉ admin: lọc theo người phụ trách ("me" = tôi, "none" = chưa ai nhận). */
  assigned: z.string().max(40).optional(),
  search: z.string().trim().max(100).optional(),
});

export const UpdateTicketBodySchema = z
  .object({
    status: TicketStatusEnum.optional(),
    priority: TicketPriorityEnum.optional(),
    assignedToId: z.string().uuid().nullable().optional(),
  })
  .strict();

// ---- FAQ
export const FaqCategoryBodySchema = z.object({ name: z.string().trim().min(1).max(100), orderIndex: z.number().int().min(0).max(9999).optional() }).strict();
export const FaqCategoryUpdateBodySchema = FaqCategoryBodySchema.partial().strict();
export const FaqItemBodySchema = z
  .object({
    categoryId: z.string().uuid(),
    question: z.string().trim().min(3).max(300),
    answer: z.string().trim().min(1).max(10000),
    orderIndex: z.number().int().min(0).max(9999).optional(),
    isPublished: z.boolean().default(true),
  })
  .strict();
export const FaqItemUpdateBodySchema = FaqItemBodySchema.partial().strict();
export const FaqReorderBodySchema = z
  .object({
    categories: z.array(z.object({ id: z.string().uuid(), orderIndex: z.number().int().min(0).max(9999) })).max(200).optional(),
    items: z.array(z.object({ id: z.string().uuid(), orderIndex: z.number().int().min(0).max(9999) })).max(1000).optional(),
  })
  .strict();
export const FaqQuerySchema = z.object({ q: z.string().trim().max(100).optional() });

export type CreateTicketBody = z.infer<typeof CreateTicketBodySchema>;
export type ListTicketsQuery = z.infer<typeof ListTicketsQuerySchema>;
export type UpdateTicketBody = z.infer<typeof UpdateTicketBodySchema>;
export type FaqItemBody = z.infer<typeof FaqItemBodySchema>;
