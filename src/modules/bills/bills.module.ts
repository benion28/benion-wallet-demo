// src/modules/bills/bills.module.ts
import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PaymentModule], // Import PaymentModule here
  controllers: [BillsController],
  providers: [BillsService],
  exports: [BillsService],
})
export class BillsModule {}