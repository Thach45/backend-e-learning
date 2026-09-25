import { z } from "zod";

export const ReactionTypeEnum = z.enum(["LIKE", "LOVE", "HELPFUL"]);
export type ReactionTypeValue = z.infer<typeof ReactionTypeEnum>;

export const ReactionCountsSchema = z.object({
  LIKE: z.number(),
  LOVE: z.number(),
  HELPFUL: z.number(),
});

// Comment Schema (base, không include nested để tránh circular)
export const CommentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  lessonId: z.string().uuid(),
  content: z.string(),
  parentId: z.string().uuid().nullable().optional(),
  createdAt: z.date(),
  user: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
      avatar: z.string().nullable().optional(),
    })
    .optional(),
  lesson: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
    })
    .optional(),
  parent: z.any().optional(), // Will be populated with CommentSchema when needed
  replies: z.array(z.any()).optional(), // Will be populated with CommentSchema[] when needed
  reactionCounts: ReactionCountsSchema.optional(),
  myReaction: ReactionTypeEnum.nullable().optional(),
});

// Query schemas
export const GetCommentsQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  lessonId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  parentId: z.string().uuid().nullable().optional(), // null = top-level, uuid = replies of that comment
}).strict();

export const GetCommentsParamsSchema = z.object({
  lessonId: z.string().uuid(),
}).strict();

export const GetCommentByIdParamsSchema = z.object({
  lessonId: z.string().uuid(),
  commentId: z.string().uuid(),
}).strict();

// Body schemas
export const CreateCommentBodySchema = z.object({
  content: z.string().min(1, "Nội dung comment không được để trống"),
  parentId: z.string().uuid().nullable().optional(), // Optional: null = top-level, uuid = reply to that comment
}).strict();

export const UpdateCommentBodySchema = z.object({
  content: z.string().min(1, "Nội dung comment không được để trống"),
}).strict();

// Response schemas
export const GetCommentResponseSchema = CommentSchema;

export const GetCommentsResponseSchema = z.object({
  data: z.array(CommentSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
}).strict();

export const ToggleReactionBodySchema = z.object({
  type: ReactionTypeEnum,
}).strict();

export const ToggleReactionResponseSchema = z.object({
  reactionCounts: ReactionCountsSchema,
  myReaction: ReactionTypeEnum.nullable(),
}).strict();

// Types
export type Comment = z.infer<typeof CommentSchema>;
export type GetCommentsQuery = z.infer<typeof GetCommentsQuerySchema>;
export type GetCommentsParams = z.infer<typeof GetCommentsParamsSchema>;
export type GetCommentByIdParams = z.infer<typeof GetCommentByIdParamsSchema>;
export type CreateCommentBody = z.infer<typeof CreateCommentBodySchema> & { lessonId: string };
export type UpdateCommentBody = z.infer<typeof UpdateCommentBodySchema>;
export type GetCommentResponse = z.infer<typeof GetCommentResponseSchema>;
export type GetCommentsResponse = z.infer<typeof GetCommentsResponseSchema>;
export type ToggleReactionBody = z.infer<typeof ToggleReactionBodySchema>;
export type ToggleReactionResponse = z.infer<typeof ToggleReactionResponseSchema>;

