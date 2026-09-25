import { Injectable, Logger } from '@nestjs/common';
import { Prisma, PaymentTxOutcome } from '@prisma/client';
import { PrismaService } from 'src/shared/service/prisma.service';
import { AuditLogService } from 'src/shared/service/audit-log.service';
import { OrdersRepo } from './orders.repo';
import { OrdersService } from './orders.service';
import { SepayWebhookPayload } from './payment-webhook.model';
import { extractOrderIdFromContent } from './sepay.util';

const PROVIDER = 'sepay';

@Injectable()
export class PaymentWebhookService {
  private readonly logger = new Logger(PaymentWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersRepo: OrdersRepo,
    private readonly ordersService: OrdersService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Xử lý một giao dịch SePay. Idempotent: cùng một giao dịch gửi nhiều lần chỉ được xử lý một lần
   * (khóa duy nhất provider + providerTxId). Ném lỗi khi có sự cố tạm thời (ví dụ DB) để SePay gửi lại.
   */
  async handleSepay(payload: SepayWebhookPayload): Promise<{ outcome: PaymentTxOutcome | 'DUPLICATE'; orderId?: string }> {
    const providerTxId = String(payload.id);

    const existing = await this.prisma.paymentTransaction.findUnique({
      where: { provider_providerTxId: { provider: PROVIDER, providerTxId } },
      select: { id: true },
    });
    if (existing) return { outcome: 'DUPLICATE' };

    let result: { outcome: PaymentTxOutcome; orderId: string | null };
    try {
      // Ghi nhận giao dịch và chốt đơn cùng một transaction: hoặc cả hai thành công, hoặc cả hai không.
      result = await this.prisma.$transaction(
        async (tx) => {
          const classified = await this.classify(tx, payload);
          await tx.paymentTransaction.create({
            data: {
              provider: PROVIDER,
              providerTxId,
              orderId: classified.orderId,
              amount: payload.transferAmount,
              transferType: payload.transferType,
              content: payload.content ?? null,
              accountNumber: payload.accountNumber ?? null,
              referenceCode: payload.referenceCode ?? null,
              outcome: classified.outcome,
              raw: payload as Prisma.InputJsonValue,
            },
          });
          return classified;
        },
        { timeout: 15000 },
      );
    } catch (error) {
      // Hai webhook cùng giao dịch tới cùng lúc: bên còn lại đã ghi trước
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return { outcome: 'DUPLICATE' };
      }
      throw error;
    }

    if (result.outcome === PaymentTxOutcome.PAID && result.orderId) {
      await this.afterPaid(result.orderId, providerTxId, payload.transferAmount);
    } else if (
      result.outcome === PaymentTxOutcome.ORDER_NOT_PENDING ||
      result.outcome === PaymentTxOutcome.AMOUNT_MISMATCH ||
      result.outcome === PaymentTxOutcome.ORDER_NOT_FOUND
    ) {
      // Tiền đã vào tài khoản nhưng không tự chốt được đơn: cần người xử lý.
      this.logger.warn(
        `SePay tx ${providerTxId}: ${result.outcome} (order=${result.orderId ?? 'n/a'}, amount=${payload.transferAmount}) — cần đối soát thủ công`,
      );
    }

    return { outcome: result.outcome, orderId: result.orderId ?? undefined };
  }

  private async classify(
    tx: Prisma.TransactionClient,
    payload: SepayWebhookPayload,
  ): Promise<{ outcome: PaymentTxOutcome; orderId: string | null }> {
    if (payload.transferType !== 'in') {
      return { outcome: PaymentTxOutcome.IGNORED, orderId: null };
    }

    const expectedAccount = process.env.SO_TAI_KHOAN?.trim();
    if (expectedAccount && payload.accountNumber?.trim() !== expectedAccount) {
      return { outcome: PaymentTxOutcome.WRONG_ACCOUNT, orderId: null };
    }

    const orderId = extractOrderIdFromContent(payload.content);
    if (!orderId) {
      return { outcome: PaymentTxOutcome.NO_ORDER_REF, orderId: null };
    }

    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { id: true, totalAmount: true },
    });
    if (!order) {
      return { outcome: PaymentTxOutcome.ORDER_NOT_FOUND, orderId: null };
    }

    // Giống luồng kiểm tra hiện có: yêu cầu đúng số tiền của đơn
    if (Math.abs(payload.transferAmount - order.totalAmount) >= 1) {
      return { outcome: PaymentTxOutcome.AMOUNT_MISMATCH, orderId: order.id };
    }

    const marked = await this.ordersRepo.markOrderPaid(tx, order.id);
    switch (marked) {
      case 'PAID':
        return { outcome: PaymentTxOutcome.PAID, orderId: order.id };
      case 'ALREADY_PAID':
        return { outcome: PaymentTxOutcome.ALREADY_PAID, orderId: order.id };
      default:
        return { outcome: PaymentTxOutcome.ORDER_NOT_PENDING, orderId: order.id };
    }
  }

  /** Việc phụ sau khi đã chốt đơn: lỗi ở đây không được làm webhook thất bại (đơn đã PAID rồi). */
  private async afterPaid(orderId: string, providerTxId: string, amount: number) {
    await this.ordersService.cancelExpiryJob(orderId);
    try {
      const order = await this.ordersRepo.getOrderById(orderId);
      await this.ordersService.sendPaymentSuccessEmail(order);
    } catch (error) {
      this.logger.error(`Không gửi được email thanh toán cho đơn ${orderId}: ${error}`);
    }
    await this.auditLogService.log({
      action: 'payment.webhook_paid',
      targetType: 'Order',
      targetId: orderId,
      metadata: { provider: PROVIDER, providerTxId, amount },
    });
  }
}
