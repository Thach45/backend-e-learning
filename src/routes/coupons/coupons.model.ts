import { z } from "zod";

const codeSchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .pipe(z.string().min(3).max(32).regex(/^[A-Z0-9_-]+$/, "Mã chỉ gồm chữ, số, dấu gạch ngang và gạch dưới"));

const dateOrNull = z.union([z.coerce.date(), z.null()]).optional();

const couponFields = {
  description: z.string().trim().max(200).nullable().optional(),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  maxDiscount: z.number().positive().nullable().optional(),
  minOrderAmount: z.number().nonnegative().nullable().optional(),
  startsAt: dateOrNull,
  expiresAt: dateOrNull,
  usageLimit: z.number().int().positive().nullable().optional(),
  perUserLimit: z.number().int().positive().optional().default(1),
  courseIds: z.array(z.string().uuid()).optional().default([]),
  isActive: z.boolean().optional().default(true),
};

const refine = <T extends z.ZodTypeAny>(schema: T) =>
  schema
    .refine((v: any) => v.type !== "PERCENT" || v.value <= 100, {
      message: "Giảm theo % không được vượt quá 100",
      path: ["value"],
    })
    .refine((v: any) => !v.startsAt || !v.expiresAt || v.startsAt < v.expiresAt, {
      message: "Ngày hết hạn phải sau ngày bắt đầu",
      path: ["expiresAt"],
    });

export const CreateCouponBodySchema = refine(z.object({ code: codeSchema, ...couponFields }).strict());
// Không cho đổi mã sau khi tạo (đơn hàng cũ đã lưu snapshot mã)
export const UpdateCouponBodySchema = refine(z.object(couponFields).strict());

export const GetCouponsQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  search: z.string().trim().optional(),
  status: z.enum(["active", "inactive", "expired"]).optional(),
}).strict();

export const CouponParamsSchema = z.object({ id: z.string().uuid() }).strict();

export const ValidateCouponBodySchema = z.object({ code: codeSchema }).strict();

export type CreateCouponBody = z.infer<typeof CreateCouponBodySchema>;
export type UpdateCouponBody = z.infer<typeof UpdateCouponBodySchema>;
export type GetCouponsQuery = z.infer<typeof GetCouponsQuerySchema>;
export type ValidateCouponBody = z.infer<typeof ValidateCouponBodySchema>;
