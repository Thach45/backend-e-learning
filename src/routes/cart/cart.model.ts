import { z } from "zod";

// CartItem Schema
export const CartItemSchema = z.object({
  id: z.string().uuid(),
  cartId: z.string().uuid(),
  courseId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  course: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      thumbnail: z.string().nullable().optional(),
      price: z.number(),
      salePrice: z.number().nullable().optional(),
      instructor: z.object({ id: z.string().uuid(), name: z.string() }).optional(),
    })
    .optional(),
}).strict();

// Cart Schema
export const CartSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  cartItems: z.array(CartItemSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  expiresAt: z.date().nullable().optional(),
}).strict();

// Get Cart Response (includes calculated totals)
export const GetCartResponseSchema = z.object({
  cart: CartSchema,
  subtotal: z.number(),
  total: z.number(),
  itemCount: z.number(),
}).strict();

// Add to Cart Body
export const AddToCartBodySchema = z.object({
  courseId: z.string().uuid(),
}).strict();

// Remove from Cart Params
export const RemoveFromCartParamsSchema = z.object({
  courseId: z.string().uuid(),
}).strict();

// Merge Cart Body (for session cart merge)
export const MergeCartBodySchema = z.object({
  courseIds: z.array(z.string().uuid()),
}).strict();

// Types
export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
export type GetCartResponse = z.infer<typeof GetCartResponseSchema>;
export type AddToCartBody = z.infer<typeof AddToCartBodySchema>;
export type RemoveFromCartParams = z.infer<typeof RemoveFromCartParamsSchema>;
export type MergeCartBody = z.infer<typeof MergeCartBodySchema>;

