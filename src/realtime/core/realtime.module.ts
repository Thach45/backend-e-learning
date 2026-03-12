
import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeDispatcherService } from './services/realtime-dispatcher.service';
import { WebsocketChannel } from './channels/websocket-channel';
import { NotificationRealtimeHandler } from '../features/notifications/notification.realtime-handler';
// sau này import thêm handler khác

@Module({
  providers: [
    RealtimeGateway,
    RealtimeDispatcherService,
    WebsocketChannel,
    {
      provide: 'RealtimeChannel',
      useExisting: WebsocketChannel,
    },

    // Handlers feature
    NotificationRealtimeHandler,
    {
        provide: 'REALTIME_HANDLERS',
        useFactory: (notificationHandler: NotificationRealtimeHandler) => [
          notificationHandler,
        ],
        inject: [NotificationRealtimeHandler],
      },
  ],
  exports: [RealtimeGateway, RealtimeDispatcherService],
})
export class RealtimeModule {}