import { z } from "zod";

export const NotificationTypeEnum = z.enum([
  "SYSTEM",
  "COURSE_ENROLL",
  "NEW_COMMENT",
  "NEW_REPLY",
  "ORDER_STATUS",
  "LEARNING_PROGRESS",
  "NEW_QUESTION",
  "NEW_ANSWER",
]);

export const NotificationStatusEnum = z.enum(["UNREAD", "READ"]);

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: NotificationTypeEnum,
  title: z.string(),
  message: z.string(),
  data: z.any().nullable().optional(),
  courseId: z.string().uuid().nullable().optional(),
  lessonId: z.string().uuid().nullable().optional(),
  orderId: z.string().uuid().nullable().optional(),
  commentId: z.string().uuid().nullable().optional(),
  status: NotificationStatusEnum,
  readAt: z.date().nullable().optional(),
  createdAt: z.date(),
});

export const GetNotificationsQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  status: NotificationStatusEnum.optional(),
}).strict();

export const GetNotificationParamsSchema = z.object({
  id: z.string().uuid(),
}).strict();

export const GetNotificationsResponseSchema = z.object({
  data: z.array(NotificationSchema),
  total: z.number(),
  unreadCount: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
}).strict();

export const GetUnreadCountResponseSchema = z.object({
  unreadCount: z.number(),
}).strict();

export const MarkReadResponseSchema = z.object({
  success: z.boolean(),
}).strict();

export type NotificationTypeValue = z.infer<typeof NotificationTypeEnum>;
export type GetNotificationsQuery = z.infer<typeof GetNotificationsQuerySchema>;
export type GetNotificationParams = z.infer<typeof GetNotificationParamsSchema>;
export type GetNotificationsResponse = z.infer<typeof GetNotificationsResponseSchema>;

export type CreateNotificationInput = {
  userId: string;
  type: NotificationTypeValue;
  title: string;
  message: string;
  data?: unknown;
  courseId?: string;
  lessonId?: string;
  orderId?: string;
  commentId?: string;
};
