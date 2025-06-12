// src/modules/transactions/transactions.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsService } from './transactions.service';
import { WalletModule } from '../wallet/wallet.module';
import { TransactionSchema } from './schemas/transaction.schema';
import { Transaction } from './models/transaction.model';
import { TransactionProvider } from './providers/transaction.provider';
import { getModelToken } from '@nestjs/mongoose';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Transaction', schema: TransactionSchema }]),
    forwardRef(() => WalletModule),
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionsService
  ],
  exports: [
    TransactionsService
  ],
})
export class TransactionsModule {}