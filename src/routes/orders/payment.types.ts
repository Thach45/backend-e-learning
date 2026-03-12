export type PaymentQr = {
  qrCodeUrl: string;
  accountNumber: string;
  bankName: string;
  amount: number;
  description: string;
  orderId: string;
};

export type PaymentCheckResult =
  | { paid: true; meta?: any }
  | { paid: false; reason?: string; meta?: any };

