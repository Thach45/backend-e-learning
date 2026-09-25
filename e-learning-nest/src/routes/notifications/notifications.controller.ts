import { Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { NotificationsService } from "./notifications.service";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import {
  GetNotificationsQueryDto,
  GetNotificationParamsDto,
  GetNotificationsResponseDto,
  GetUnreadCountResponseDto,
  MarkReadResponseDto,
} from "./notifications.dto";

@Controller("api/notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ZodSerializerDto(GetNotificationsResponseDto)
  async getMyNotifications(@Query() query: GetNotificationsQueryDto, @ActiveUser() user: any) {
    return this.notificationsService.getNotifications(query as any, user.userId);
  }

  @Get("unread-count")
  @ZodSerializerDto(GetUnreadCountResponseDto)
  async getUnreadCount(@ActiveUser() user: any) {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  @Patch("read-all")
  @ZodSerializerDto(MarkReadResponseDto)
  async markAllAsRead(@ActiveUser() user: any) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Patch(":id/read")
  @ZodSerializerDto(MarkReadResponseDto)
  async markAsRead(@Param() params: GetNotificationParamsDto, @ActiveUser() user: any) {
    return this.notificationsService.markAsRead((params as any).id, user.userId);
  }
}
