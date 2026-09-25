
import { Inject, Injectable, Logger } from '@nestjs/common';
import { RealtimeEvent } from '../interfaces/realtime-event.interface';
import { RealtimeHandler } from '../interfaces/realtime-handler.interface';

@Injectable()
export class RealtimeDispatcherService {
  private readonly logger = new Logger(RealtimeDispatcherService.name);

  constructor(
    @Inject('REALTIME_HANDLERS')
    private readonly handlers: RealtimeHandler[],
  ) {}

  async dispatch(event: RealtimeEvent): Promise<void> {
    // tìm handler phù hợp
    const matchingHandlers = this.handlers.filter((h) => h.supports(event));

    if (matchingHandlers.length === 0) {
      this.logger.warn(`No handler for event type=${event.type}`);
      return;
    }

    await Promise.all(matchingHandlers.map((h) => h.handle(event)));
  }
}