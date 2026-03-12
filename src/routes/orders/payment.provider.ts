import { PaymentCheckResult, PaymentQr } from './payment.types';

export interface PaymentProvider {
  getQrCode(order: { id: string; totalAmount: number }): Promise<PaymentQr>;

  checkPayment(order: { id: string; totalAmount: number }): Promise<PaymentCheckResult>;
}

