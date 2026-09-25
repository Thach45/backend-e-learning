import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { OrdersService } from './orders.service';
import { EXPIRE_JOB, ORDER_EXPIRY_QUEUE, SWEEP_JOB } from './order-expiry.constants';

/**
 * Worker xử lý hết hạn thanh toán. Chỉ đổi trạng thái đơn còn PENDING sang FAILED và trả lượt coupon;
 * việc "đơn đã được thanh toán chưa" do webhook SePay chốt PAID, worker không cần hỏi lại SePay.
 */
@Processor(ORDER_EXPIRY_QUEUE)
export class OrderExpiryProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderExpiryProcessor.name);

  constructor(private readonly ordersService: OrdersService) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case EXPIRE_JOB: {
        const failed = await this.ordersService.failOrder(job.data.orderId, 'expired');
        if (failed) this.logger.log(`Đơn ${job.data.orderId} hết hạn thanh toán, đã hủy`);
        return failed;
      }
      case SWEEP_JOB: {
        const count = await this.ordersService.expireOverdueOrders();
        if (count > 0) this.logger.log(`Quét: đã hủy ${count} đơn quá hạn thanh toán`);
        return count;
      }
      default:
        this.logger.warn(`Job không xác định: ${job.name}`);
        return null;
    }
  }
}
