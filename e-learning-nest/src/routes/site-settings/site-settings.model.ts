import { z } from "zod";

/** Chuỗi rỗng coi như "xoá link". Chỉ nhận https:// để không bị chèn javascript: hay scheme lạ vào thẻ <a href>. */
const socialUrl = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z
    .string()
    .trim()
    .max(300)
    .url()
    .refine((u) => u.startsWith("https://"), "Chỉ chấp nhận liên kết bắt đầu bằng https://")
    .nullable(),
);

export const SOCIAL_KEYS = [
  "facebookUrl",
  "instagramUrl",
  "twitterUrl",
  "youtubeUrl",
  "linkedinUrl",
  "tiktokUrl",
  "zaloUrl",
] as const;

export const UpdateSiteSettingsBodySchema = z
  .object({
    facebookUrl: socialUrl.optional(),
    instagramUrl: socialUrl.optional(),
    twitterUrl: socialUrl.optional(),
    youtubeUrl: socialUrl.optional(),
    linkedinUrl: socialUrl.optional(),
    tiktokUrl: socialUrl.optional(),
    zaloUrl: socialUrl.optional(),
    maintenanceEnabled: z.boolean().optional(),
    maintenanceMessage: z.preprocess((v) => (v === "" ? null : v), z.string().trim().max(500).nullable()).optional(),
    maintenanceUntil: z.preprocess((v) => (v === "" ? null : v), z.coerce.date().nullable()).optional(),
  })
  .strict();

const nullableUrl = z.string().nullable();

export const AdminSiteSettingsResponseSchema = z.object({
  facebookUrl: nullableUrl,
  instagramUrl: nullableUrl,
  twitterUrl: nullableUrl,
  youtubeUrl: nullableUrl,
  linkedinUrl: nullableUrl,
  tiktokUrl: nullableUrl,
  zaloUrl: nullableUrl,
  maintenanceEnabled: z.boolean(),
  maintenanceMessage: z.string().nullable(),
  maintenanceUntil: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export const PublicSiteSettingsResponseSchema = z.object({
  social: z.object({
    facebookUrl: nullableUrl,
    instagramUrl: nullableUrl,
    twitterUrl: nullableUrl,
    youtubeUrl: nullableUrl,
    linkedinUrl: nullableUrl,
    tiktokUrl: nullableUrl,
    zaloUrl: nullableUrl,
  }),
  maintenance: z.object({
    enabled: z.boolean(),
    message: z.string().nullable(),
    until: z.string().nullable(), // ISO
  }),
});

export type UpdateSiteSettingsBody = z.infer<typeof UpdateSiteSettingsBodySchema>;
