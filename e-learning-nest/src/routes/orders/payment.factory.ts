import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentProvider } from './payment.provider';
import { SepayPaymentProvider } from './sepay.provider';

@Injectable()
export class PaymentProviderFactory {
  constructor(private readonly sepayProvider: SepayPaymentProvider) {}

  getProvider(): PaymentProvider {
    const providerKey = process.env.PAYMENT_PROVIDER?.toLowerCase() || 'sepay';

    switch (providerKey) {
      case 'sepay':
        return this.sepayProvider;
      default:
        throw new BadRequestException(`Unsupported payment provider: ${providerKey}`);
    }
  }
}

