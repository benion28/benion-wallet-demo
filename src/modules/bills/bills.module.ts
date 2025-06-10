// src/modules/bills/bills.module.ts
import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { PaymentModule } from '../payment/payment.module';
import { WalletModule } from '../wallet/wallet.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { EventModule } from '../events/event.module';

@Module({
  imports: [
    PaymentModule,
    WalletModule,
    TransactionsModule,
    EventModule
  ],
  controllers: [BillsController],
  providers: [BillsService],
  exports: [BillsService],
})
export class BillsModule {}