// src/modules/payment/payment.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PaystackGateway } from '../../common/gateways/paystack.gateway';
import { PaymentGateway } from '../../common/interfaces/payment-gateway.interface';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [
    {
      provide: 'PAYMENT_GATEWAY',
      useClass: PaystackGateway,
    },
  ],
  exports: ['PAYMENT_GATEWAY'], // Make sure this is exported
})
export class PaymentModule {}