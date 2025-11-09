import { z } from "zod";

export const WishlistSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
  createdAt: z.date(),
  course: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      thumbnail: z.string().nullable().optional(),
      price: z.number(),
      salePrice: z.number().nullable().optional(),
      introVideo: z.string().nullable().optional(),
      isFeatured: z.boolean(),
      level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
      status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "PENDING_PUBLISHED", "PENDING_DRAFT"]),
      instructor: z.object({ id: z.string().uuid(), name: z.string() }).optional(),
      category: z.object({ id: z.string().uuid(), name: z.string() }).nullable().optional(),
      totalStars: z.number().optional(),
      totalLearners: z.number().optional(),
      totalLikes: z.number().optional(),
    })
    .optional(),
  user: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
      avatar: z.string().nullable().optional(),
    })
    .optional(),
});

export const GetWishlistQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
}).strict();

export const GetWishlistParamsSchema = z.object({
  courseId: z.string().uuid(),
}).strict();

export const GetWishlistResponseSchema = WishlistSchema;

export const GetWishlistListResponseSchema = z.object({
  data: z.array(WishlistSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
}).strict();

export const CheckWishlistResponseSchema = z.object({
  isInWishlist: z.boolean(),
}).strict();

export type Wishlist = z.infer<typeof WishlistSchema>;
export type GetWishlistQuery = z.infer<typeof GetWishlistQuerySchema>;
export type GetWishlistParams = z.infer<typeof GetWishlistParamsSchema>;
export type GetWishlistResponse = z.infer<typeof GetWishlistResponseSchema>;
export type GetWishlistListResponse = z.infer<typeof GetWishlistListResponseSchema>;
export type CheckWishlistResponse = z.infer<typeof CheckWishlistResponseSchema>;

