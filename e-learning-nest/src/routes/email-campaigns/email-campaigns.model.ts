import { z } from "zod";

export const CampaignStatusEnum = z.enum([
  "DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "SCHEDULED", "SENDING", "SENT", "CANCELLED",
]);

export const AudienceSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("ALL_USERS") }), // chỉ admin
  z.object({ type: z.literal("ROLE"), role: z.enum(["CLIENT", "INSTRUCTOR"]) }), // chỉ admin
  z.object({ type: z.literal("COURSE_ENROLLEES"), courseId: z.string().uuid() }), // admin: mọi khoá; giảng viên: khoá của mình
  z.object({ type: z.literal("INSTRUCTOR_STUDENTS") }), // giảng viên: mọi học viên của khoá mình
  z.object({ type: z.literal("INTEREST_TAG"), tagId: z.string().uuid() }), // chỉ admin, chỉ người đã đồng ý cá nhân hoá
  z.object({ type: z.literal("SPECIFIC_USERS"), userIds: z.array(z.string().uuid()).min(1).max(50) }), // chỉ admin
]);
export type Audience = z.infer<typeof AudienceSchema>;

const subject = z.string().trim().min(1).max(200);
const body = z.string().trim().min(1).max(20000);

export const CreateCampaignBodySchema = z
  .object({ subject, body, audience: AudienceSchema, isServiceNotice: z.boolean().default(false) })
  .strict();

export const UpdateCampaignBodySchema = z
  .object({ subject: subject.optional(), body: body.optional(), audience: AudienceSchema.optional(), isServiceNotice: z.boolean().optional() })
  .strict();

export const ListCampaignsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: CampaignStatusEnum.optional(),
  /** Admin: true = chỉ chiến dịch của chính mình (mặc định thấy tất cả). Giảng viên luôn chỉ thấy của mình. */
  mine: z.enum(["true", "false"]).optional(),
});

export const CampaignIdParamsSchema = z.object({ id: z.string().uuid() }).strict();
export const RejectCampaignBodySchema = z.object({ reason: z.string().trim().min(5).max(500) }).strict();
export const SendCampaignBodySchema = z.object({ scheduledAt: z.coerce.date().optional() }).strict();

export const UnsubscribeTokenBodySchema = z.object({ token: z.string().max(300).optional() }).passthrough();
export const UnsubscribeQuerySchema = z.object({ token: z.string().max(300).optional() });
export const UpdateEmailPreferencesBodySchema = z.object({ campaignEmails: z.boolean() }).strict();

export type CreateCampaignBody = z.infer<typeof CreateCampaignBodySchema>;
export type UpdateCampaignBody = z.infer<typeof UpdateCampaignBodySchema>;
export type ListCampaignsQuery = z.infer<typeof ListCampaignsQuerySchema>;
