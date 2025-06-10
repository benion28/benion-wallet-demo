// src/modules/bills/bills.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { PaymentGateway } from '../../common/interfaces/payment-gateway.interface';

@Injectable()
export class BillsService {
  constructor(
    @Inject('PAYMENT_GATEWAY')
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async initializePayment(amount: number, email: string, reference: string, metadata?: any) {
    return this.paymentGateway.initializePayment(amount, email, reference, metadata);
  }
}