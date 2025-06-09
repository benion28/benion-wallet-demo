import { IPaymentGateway } from '@/common/interfaces/payment-gateway.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class BillsService {
  constructor(@Inject('PAYMENT_SERVICE') private readonly paymentGateway: IPaymentGateway) {}

  async initializePayment(data: any) {
    return this.paymentGateway.initializeTransaction(data);
  }

  async verifyPayment(reference: string) {
    return this.paymentGateway.verifyTransaction(reference);
  }
}
