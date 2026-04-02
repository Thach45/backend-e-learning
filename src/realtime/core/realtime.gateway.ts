
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { RealtimeDispatcherService } from './services/realtime-dispatcher.service';
  import { RealtimeEvent } from './interfaces/realtime-event.interface';
  
  @WebSocketGateway({
    namespace: '/realtime',
    cors: { origin: '*' },
  })
  export class RealtimeGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;
  
    constructor(
      private readonly dispatcher: RealtimeDispatcherService,
    ) {}
  
    async handleConnection(client: Socket) {
      // TODO: auth, lấy userId từ token
      const userId = client.handshake.auth.userId;
      if (userId) {
        client.join(`user:${userId}`);
      }
    }
 
    @SubscribeMessage('event')
    async onEvent(
      @MessageBody() data: RealtimeEvent,
      @ConnectedSocket() client: Socket,
    ) {
      const userId = client.handshake.auth.userId;
    const event: RealtimeEvent = {
        ...data,
        userId: userId ?? data.userId,
      };
  
    // Emit realtime tới client trước (generic)
    if (event.userId) {
      this.server.to(`user:${event.userId}`).emit('event', event);
    }

    // Sau đó cho dispatcher xử lý các side-effect khác
    await this.dispatcher.dispatch(event);
    }
  }