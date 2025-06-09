import { Module } from '@nestjs/common';
import { PaystackService } from './providers/paystack.service';
import { MockPaymentService } from './providers/mock-payment.service';
import { ConfigService } from '@nestjs/config';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';

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