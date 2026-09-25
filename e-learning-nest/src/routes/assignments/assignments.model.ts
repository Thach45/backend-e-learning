import { z } from "zod";

const httpsUrl = z.string().trim().max(500).url().refine((u) => u.startsWith("https://"), "Chỉ chấp nhận liên kết https://");
const nullableDate = z.preprocess((v) => (v === "" ? null : v), z.coerce.date().nullable());

export const CourseIdParamsSchema = z.object({ courseId: z.string().uuid() }).strict();
export const IdParamsSchema = z.object({ id: z.string().uuid() }).strict();

export const CreateAssignmentBodySchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(10000),
    dueAt: nullableDate.optional(),
    maxScore: z.number().int().min(1).max(1000).default(100),
    allowLate: z.boolean().default(true),
    isPublished: z.boolean().default(true),
    lessonId: z.string().uuid().nullable().optional(),
  })
  .strict();

export const UpdateAssignmentBodySchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(10000).optional(),
    dueAt: nullableDate.optional(),
    maxScore: z.number().int().min(1).max(1000).optional(),
    allowLate: z.boolean().optional(),
    isPublished: z.boolean().optional(),
    lessonId: z.string().uuid().nullable().optional(),
  })
  .strict();

/** Phải có nội dung văn bản hoặc một tệp/liên kết (https). */
export const SubmitBodySchema = z
  .object({
    textContent: z.string().trim().max(20000).nullable().optional(),
    fileUrl: httpsUrl.nullable().optional(),
    fileName: z.string().trim().max(200).nullable().optional(),
  })
  .strict()
  .refine((b) => !!(b.textContent && b.textContent.length > 0) || !!b.fileUrl, { message: "Hãy nhập nội dung hoặc đính kèm tệp/liên kết" });

export const GradeBodySchema = z
  .object({
    score: z.number().int().min(0).optional(),
    feedback: z.string().trim().max(5000).nullable().optional(),
    /** true: trả lại để học viên sửa (bắt buộc có nhận xét), không chấm điểm. */
    returnForRevision: z.boolean().default(false),
  })
  .strict();

export const ListSubmissionsQuerySchema = z.object({
  status: z.enum(["SUBMITTED", "GRADED", "RETURNED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateAssignmentBody = z.infer<typeof CreateAssignmentBodySchema>;
export type UpdateAssignmentBody = z.infer<typeof UpdateAssignmentBodySchema>;
export type SubmitBody = z.infer<typeof SubmitBodySchema>;
export type GradeBody = z.infer<typeof GradeBodySchema>;
export type ListSubmissionsQuery = z.infer<typeof ListSubmissionsQuerySchema>;
