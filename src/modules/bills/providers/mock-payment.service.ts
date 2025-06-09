import { IPaymentGateway } from '@/common/interfaces/payment-gateway.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MockPaymentService implements IPaymentGateway {
  async initializeTransaction(data: any) {
    return {
      status: true,
      data: { authorization_url: 'https://mockpay.com/authorize', reference: 'mock-ref' },
    };
  }

  async verifyTransaction(reference: string) {
    return {
      status: true,
      data: { status: 'success', reference },
    };
  }
}