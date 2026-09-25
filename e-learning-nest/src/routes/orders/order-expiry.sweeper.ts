import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { Queue } from 'bullmq';
import { ORDER_EXPIRY_QUEUE, SWEEP_EVERY_MS, SWEEP_JOB } from './order-expiry.constants';

/** Đăng ký job quét lặp mỗi phút (upsert nên khởi động lại nhiều lần cũng chỉ có một lịch). */
@Injectable()
export class OrderExpirySweeper implements OnModuleInit {
  private readonly logger = new Logger(OrderExpirySweeper.name);

  constructor(@InjectQueue(ORDER_EXPIRY_QUEUE) private readonly queue: Queue) {}

  async onModuleInit() {
    try {
      await this.queue.upsertJobScheduler(
        'order-expiry-sweep',
        { every: SWEEP_EVERY_MS },
        { name: SWEEP_JOB, opts: { removeOnComplete: true, removeOnFail: 20 } },
      );
    } catch (error) {
      this.logger.error(`Không đăng ký được job quét đơn quá hạn: ${error}`);
    }
  }
}
