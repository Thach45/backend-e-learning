import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentProvider } from './payment.provider';
import { PaymentCheckResult, PaymentQr } from './payment.types';

@Injectable()
export class SepayPaymentProvider implements PaymentProvider {
  async getQrCode(order: { id: string; totalAmount: number }): Promise<PaymentQr> {
    const acc = process.env.SO_TAI_KHOAN;
    const bank = process.env.NGAN_HANG;

    if (!acc || !bank) {
      throw new BadRequestException('SePay bank configuration is missing');
    }

    const amount = order.totalAmount;
    const des = `OrderID ${order.id}`;
    const qrCodeUrl = `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${des}`;

    return {
      qrCodeUrl,
      accountNumber: acc,
      bankName: bank,
      amount: order.totalAmount,
      description: des,
      orderId: order.id,
    };
  }

  async checkPayment(order: { id: string; totalAmount: number }): Promise<PaymentCheckResult> {
    const expectedAmount = order.totalAmount;
    const sepayAccountNumber = process.env.SO_TAI_KHOAN;
    const sepayApiToken = process.env.SEPAY_API_KEY;

    if (!sepayAccountNumber || !sepayApiToken) {
      throw new BadRequestException('SePay configuration is missing');
    }
    if(order.totalAmount === 0){
        return { paid: true, meta: {} };
    }

    const url = `https://my.sepay.vn/userapi/transactions/list?account_number=${sepayAccountNumber}&limit=20`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sepayApiToken}`,
        },
      });

      if (!response.ok) {
        throw new BadRequestException(`SePay API error: ${response.statusText}`);
      }

      const responseData = await response.json();

      if (!responseData || !responseData.transactions) {
        return { paid: false, reason: 'No transactions in response data', meta: responseData };
      }

      const transactions = responseData.transactions as any[];

      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i] as any;
        const transactionContent: string | undefined = transaction.transaction_content;
        const amountInStr: string | undefined = transaction.amount_in;

        if (!transactionContent) {
          continue;
        }

        const pattern =
          /orderid\s+([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|[a-f0-9]{32})/i;
        const matcher = transactionContent.match(pattern);

        if (!matcher) {
          continue;
        }

        let extractedUuid = matcher[1].toLowerCase();

        let normalizedExtractedUuid: string;
        if (extractedUuid.length === 32) {
          normalizedExtractedUuid =
            extractedUuid.substring(0, 8) +
            '-' +
            extractedUuid.substring(8, 12) +
            '-' +
            extractedUuid.substring(12, 16) +
            '-' +
            extractedUuid.substring(16, 20) +
            '-' +
            extractedUuid.substring(20, 32);
        } else {
          normalizedExtractedUuid = extractedUuid.toLowerCase();
        }

        const normalizedOrderId = order.id.toLowerCase();

        if (normalizedExtractedUuid !== normalizedOrderId) {
          continue;
        }

        if (!amountInStr) {
          continue;
        }

        try {
          const amountIn = parseFloat(amountInStr);
          const expectedAmountInVND = expectedAmount;

          if (Math.abs(amountIn - expectedAmountInVND) < 1) {
            return {
              paid: true,
              meta: {
                transaction,
              },
            };
          }
        } catch {
          continue;
        }
      }

      return { paid: false, reason: 'Payment not found. Please check your transaction or try again later.' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Error checking payment status. Please try again later.');
    }
  }
}

