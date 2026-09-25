import { Injectable, Logger } from "@nestjs/common";
import { NotificationsRepository } from "./notifications.repo";
import { WebsocketChannel } from "src/realtime/core/channels/websocket-channel";
import { CreateNotificationInput, GetNotificationsQuery } from "./notifications.model";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationsRepo: NotificationsRepository,
    private readonly websocketChannel: WebsocketChannel,
  ) {}

  async getNotifications(query: GetNotificationsQuery, userId: string) {
    return this.notificationsRepo.getNotifications(query, userId);
  }

  async getUnreadCount(userId: string) {
    return this.notificationsRepo.getUnreadCount(userId);
  }

  async markAsRead(id: string, userId: string) {
    return this.notificationsRepo.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string) {
    return this.notificationsRepo.markAllAsRead(userId);
  }

  /**
   * Tạo thông báo mới và đẩy realtime tới user qua socket.
   * Đây là điểm vào dùng chung cho các module khác (comments, enrollments, course-content, ...).
   * Lỗi realtime không được để làm hỏng luồng nghiệp vụ gọi tới đây.
   */
  async create(input: CreateNotificationInput) {
    const created = await this.notificationsRepo.create(input);

    try {
      await this.websocketChannel.sendToUser(input.userId, {
        type: "notification.new",
        userId: input.userId,
        payload: created,
      });
    } catch (error) {
      this.logger.warn(`Không thể đẩy realtime notification tới user ${input.userId}: ${error}`);
    }

    return created;
  }
}
