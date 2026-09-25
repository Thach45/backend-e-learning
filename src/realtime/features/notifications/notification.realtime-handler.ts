
import { Injectable, Logger } from '@nestjs/common';
import { RealtimeHandler } from '../../core/interfaces/realtime-handler.interface';
import { RealtimeEvent } from '../../core/interfaces/realtime-event.interface';
import { PrismaService } from 'src/shared/service/prisma.service';

@Injectable()
export class NotificationRealtimeHandler implements RealtimeHandler {
  private readonly logger = new Logger(NotificationRealtimeHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  supports(event: RealtimeEvent): boolean {
    return event.type === 'notification.new';
  }

  async handle(event: RealtimeEvent): Promise<void> {
    if (!event.userId) {
      this.logger.warn('Bỏ qua notification.new: thiếu userId người nhận');
      return;
    }

    const payload = event.payload ?? {};
    const { type, title, message, data, courseId, lessonId, orderId, commentId } = payload;

    if (!type || !title || !message) {
      this.logger.warn('Bỏ qua notification.new: thiếu type/title/message trong payload');
      return;
    }

    await this.prisma.notification.create({
      data: {
        userId: event.userId,
        type,
        title,
        message,
        data: data ?? undefined,
        courseId: courseId ?? undefined,
        lessonId: lessonId ?? undefined,
        orderId: orderId ?? undefined,
        commentId: commentId ?? undefined,
      },
    });
  }
}
