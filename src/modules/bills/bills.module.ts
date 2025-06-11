// src/modules/bills/bills.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { TransactionSchema } from '../transactions/schemas/transaction.schema';
import { TransactionProvider } from '../transactions/providers/transaction.provider';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { PaymentModule } from '../payment/payment.module';
import { WalletModule } from '../wallet/wallet.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Transaction', schema: TransactionSchema }]),
    forwardRef(() => PaymentModule),
    forwardRef(() => WalletModule),
    forwardRef(() => TransactionsModule),
    EventEmitterModule.forRoot()
  ],
  controllers: [BillsController],
  providers: [BillsService],
  exports: [
    BillsService
  ]
})
export class BillsModule {}