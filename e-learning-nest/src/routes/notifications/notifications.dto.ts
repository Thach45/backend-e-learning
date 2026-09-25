import { createZodDto } from "nestjs-zod";
import {
  GetNotificationsQuerySchema,
  GetNotificationParamsSchema,
  GetNotificationsResponseSchema,
  GetUnreadCountResponseSchema,
  MarkReadResponseSchema,
} from "./notifications.model";

export class GetNotificationsQueryDto extends createZodDto(GetNotificationsQuerySchema) {}
export class GetNotificationParamsDto extends createZodDto(GetNotificationParamsSchema) {}
export class GetNotificationsResponseDto extends createZodDto(GetNotificationsResponseSchema) {}
export class GetUnreadCountResponseDto extends createZodDto(GetUnreadCountResponseSchema) {}
export class MarkReadResponseDto extends createZodDto(MarkReadResponseSchema) {}
