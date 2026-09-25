
import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeDispatcherService } from './services/realtime-dispatcher.service';
import { WebsocketChannel } from './channels/websocket-channel';
import { NotificationRealtimeHandler } from '../features/notifications/notification.realtime-handler';
import { SharedModule } from 'src/shared/shared.module';
// sau này import thêm handler khác

@Module({
  imports: [SharedModule],
  providers: [
    RealtimeGateway,
    RealtimeDispatcherService,
    WebsocketChannel,
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
  exports: [RealtimeGateway, RealtimeDispatcherService, WebsocketChannel],
})
export class RealtimeModule {}
