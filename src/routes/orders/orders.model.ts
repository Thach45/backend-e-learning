import { z } from "zod";

// OrderItem Schema
export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  courseId: z.string().uuid(),
  price: z.number(),
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

// Order Schema
export const OrderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  totalAmount: z.number(),
  status: z.enum(["PENDING", "PAID", "FAILED"]),
  createdAt: z.date(),
  orderItems: z.array(OrderItemSchema),
  user: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
      avatar: z.string().nullable().optional(),
    })
    .optional(),
}).strict();

// Create Order Body (from cart)
export const CreateOrderBodySchema = z.object({
  // Empty - sẽ lấy từ cart của user
}).strict();

// Get Orders Query
export const GetOrdersQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  search: z.string().trim().optional(),
  status: z.enum(["PENDING", "PAID", "FAILED"]).optional(),
  userId: z.string().uuid().optional(),
}).strict();

// Get Order Params
export const GetOrderParamsSchema = z.object({
  orderId: z.string().uuid(),
}).strict();

// Update Order Status Body
export const UpdateOrderStatusBodySchema = z.object({
  status: z.enum(["PENDING", "PAID", "FAILED"]),
}).strict();

// Pay Order Body (optional - có thể dùng để thêm payment info sau)
export const PayOrderBodySchema = z.object({
  // Có thể thêm paymentMethod, transactionId, etc. sau
}).strict();

// Response Schemas
export const GetOrderResponseSchema = OrderSchema;
export const GetOrdersResponseSchema = z.object({
  data: z.array(OrderSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
}).strict();

// Types
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type CreateOrderBody = z.infer<typeof CreateOrderBodySchema>;
export type GetOrdersQuery = z.infer<typeof GetOrdersQuerySchema>;
export type GetOrderParams = z.infer<typeof GetOrderParamsSchema>;
export type UpdateOrderStatusBody = z.infer<typeof UpdateOrderStatusBodySchema>;
export type PayOrderBody = z.infer<typeof PayOrderBodySchema>;
export type GetOrderResponse = z.infer<typeof GetOrderResponseSchema>;
export type GetOrdersResponse = z.infer<typeof GetOrdersResponseSchema>;

