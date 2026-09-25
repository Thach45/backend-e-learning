
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Logger } from '@nestjs/common';
  import { Server, Socket } from 'socket.io';
  import { RealtimeDispatcherService } from './services/realtime-dispatcher.service';
  import { RealtimeEvent } from './interfaces/realtime-event.interface';
  import { TokenService } from 'src/shared/service/token.service';

  @WebSocketGateway({
    namespace: '/realtime',
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  })
  export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(RealtimeGateway.name);

    constructor(
      private readonly dispatcher: RealtimeDispatcherService,
      private readonly tokenService: TokenService,
    ) {}

    async handleConnection(client: Socket) {
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Socket ${client.id} bị từ chối: không có access token`);
        client.disconnect(true);
        return;
      }

      try {
        const payload = await this.tokenService.verifyAccessToken(token);
        client.data.userId = payload.userId;
        await client.join(`user:${payload.userId}`);
      } catch {
        this.logger.warn(`Socket ${client.id} bị từ chối: access token không hợp lệ/hết hạn`);
        client.disconnect(true);
      }
    }

    handleDisconnect(client: Socket) {
      void client;
    }

    private extractToken(client: Socket): string | undefined {
      const authToken = client.handshake.auth?.token as string | undefined;
      if (authToken) return authToken.replace(/^Bearer\s+/i, '');

      const header = client.handshake.headers?.authorization;
      if (typeof header === 'string') return header.replace(/^Bearer\s+/i, '');

      return undefined;
    }

    @SubscribeMessage('event')
    async onEvent(
      @MessageBody() data: Omit<RealtimeEvent, 'userId'>,
      @ConnectedSocket() client: Socket,
    ) {
      // userId luôn lấy từ socket đã xác thực (handleConnection), client không thể giả mạo
      // gửi sự kiện thay cho user khác.
      const userId = client.data.userId as string | undefined;
      if (!userId) {
        return;
      }

      const event: RealtimeEvent = {
        ...data,
        userId,
      };

      this.server.to(`user:${userId}`).emit('event', event);

      await this.dispatcher.dispatch(event);
    }
  }
