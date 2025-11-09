import { z } from "zod";

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable().optional(),
  createdAt: z.date(),
  user: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
      avatar: z.string().nullable().optional(),
    })
    .optional(),
  course: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
    })
    .optional(),
});

export const GetReviewsQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  courseId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
}).strict();

export const GetReviewParamsSchema = z.object({
  courseId: z.string().uuid(),
}).strict();

export const GetReviewByIdParamsSchema = z.object({
  courseId: z.string().uuid(),
  reviewId: z.string().uuid(),
}).strict();

export const CreateReviewBodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
}).strict();

export const UpdateReviewBodySchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().nullable().optional(),
}).strict();

export const GetReviewResponseSchema = ReviewSchema;

export const GetReviewsResponseSchema = z.object({
  data: z.array(ReviewSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
}).strict();

export type Review = z.infer<typeof ReviewSchema>;
export type GetReviewsQuery = z.infer<typeof GetReviewsQuerySchema>;
export type GetReviewParams = z.infer<typeof GetReviewParamsSchema>;
export type GetReviewByIdParams = z.infer<typeof GetReviewByIdParamsSchema>;
export type CreateReviewBody = z.infer<typeof CreateReviewBodySchema> & { courseId: string };
export type UpdateReviewBody = z.infer<typeof UpdateReviewBodySchema>;
export type GetReviewResponse = z.infer<typeof GetReviewResponseSchema>;
export type GetReviewsResponse = z.infer<typeof GetReviewsResponseSchema>;

