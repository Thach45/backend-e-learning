
import { Injectable } from '@nestjs/common';
import { RealtimeChannel } from '../interfaces/realtime-channel.interface';
import { RealtimeGateway } from '../realtime.gateway';
import { RealtimeEvent } from '../interfaces/realtime-event.interface';

@Injectable()
export class WebsocketChannel implements RealtimeChannel {
  constructor(private readonly gateway: RealtimeGateway) {}

  async sendToUser(userId: string, event: RealtimeEvent): Promise<void> {
    this.gateway.server.to(`user:${userId}`).emit('event', event);
  }

  async sendToRoom(room: string, event: RealtimeEvent): Promise<void> {
    this.gateway.server.to(room).emit('event', event);
  }
}