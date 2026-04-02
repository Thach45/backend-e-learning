
import { Injectable } from '@nestjs/common';
import { RealtimeHandler } from '../../core/interfaces/realtime-handler.interface';
import { RealtimeEvent } from '../../core/interfaces/realtime-event.interface';
// Handler không phụ thuộc IO, chỉ lo logic domain

@Injectable()
export class NotificationRealtimeHandler implements RealtimeHandler {

  supports(event: RealtimeEvent): boolean {
    return event.type.startsWith('notification.');
  }

  async handle(event: RealtimeEvent): Promise<void> {
    // TODO: xử lý logic notification (lưu DB, thống kê, ...)
    void event;
  }
}