import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { PaystackService } from './providers/paystack.service';
import { MockPaymentService } from './providers/mock-payment.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [BillsController],
  providers: [
    BillsService,
    {
      provide: 'PAYMENT_SERVICE',
      useFactory: (config: ConfigService) => {
        return config.get('NODE_ENV') === 'production'
          ? new PaystackService()
          : new MockPaymentService();
      },
      inject: [ConfigService],
    },
  ],
  exports: ['PAYMENT_SERVICE'],
})
export class BillsModule {}