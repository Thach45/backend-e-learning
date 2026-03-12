
import { Inject, Injectable } from '@nestjs/common';
import { RealtimeHandler } from '../../core/interfaces/realtime-handler.interface';
import { RealtimeEvent } from '../../core/interfaces/realtime-event.interface';
import { RealtimeChannel } from '../../core/interfaces/realtime-channel.interface';

@Injectable()
export class NotificationRealtimeHandler implements RealtimeHandler {
    constructor(
        @Inject('RealtimeChannel')
        private readonly channel: RealtimeChannel, // WebSocketChannel implement
      ) {}

  supports(event: RealtimeEvent): boolean {
    return event.type.startsWith('notification.');
  }

  async handle(event: RealtimeEvent): Promise<void> {
    if (!event.userId) return;
    // lưu DB nếu cần → NotificationService
    // bắn realtime
    await this.channel.sendToUser(event.userId, event);
  }
}