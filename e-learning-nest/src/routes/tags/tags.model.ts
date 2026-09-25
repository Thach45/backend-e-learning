import { z } from "zod";

export const TagTypeEnum = z.enum(["SKILL", "TOPIC", "TOOL"]);

export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  type: TagTypeEnum,
  categoryId: z.string().uuid().nullable(),
});

export const AdminTagSchema = TagSchema.extend({
  isActive: z.boolean(),
  coursesCount: z.number(),
  usersCount: z.number(),
});

export const GetTagsQuerySchema = z.object({
  q: z.string().trim().max(50).optional(),
  type: TagTypeEnum.optional(),
  categoryId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export const TagIdParamsSchema = z.object({ id: z.string().uuid() }).strict();

export const CreateTagBodySchema = z
  .object({
    name: z.string().trim().min(2).max(50),
    type: TagTypeEnum.default("SKILL"),
    categoryId: z.string().uuid().nullable().optional(),
  })
  .strict();

export const UpdateTagBodySchema = z
  .object({
    name: z.string().trim().min(2).max(50).optional(),
    type: TagTypeEnum.optional(),
    categoryId: z.string().uuid().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

/** Tối đa 8 thẻ cho mỗi khoá học. */
export const SetCourseTagsBodySchema = z
  .object({ tagIds: z.array(z.string().uuid()).max(8) })
  .strict();

export const CourseIdParamsSchema = z.object({ id: z.string().uuid() }).strict();

export const TagListSchema = z.array(TagSchema);
export const AdminTagListSchema = z.array(AdminTagSchema);

export type GetTagsQuery = z.infer<typeof GetTagsQuerySchema>;
export type CreateTagBody = z.infer<typeof CreateTagBodySchema>;
export type UpdateTagBody = z.infer<typeof UpdateTagBodySchema>;
