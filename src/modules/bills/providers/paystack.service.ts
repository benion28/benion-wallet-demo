import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { IPaymentGateway } from '@/common/interfaces/payment-gateway.interface';

@Injectable()
export class PaystackService implements IPaymentGateway {
  private readonly baseUrl = 'https://api.paystack.co';

  async initializeTransaction(data: any) {
    const res = await axios.post(`${this.baseUrl}/transaction/initialize`, data, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    return res.data;
  }

  async verifyTransaction(reference: string) {
    const res = await axios.get(`${this.baseUrl}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    return res.data;
  }
}