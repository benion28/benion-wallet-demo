// src/modules/wallet/wallet.service.ts
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wallet } from './schemas/wallet.schema';
import { TransactionsService } from '../transactions/transactions.service';
import { BillsService } from '../bills/bills.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService,
    @Inject(forwardRef(() => BillsService))
    private readonly billsService: BillsService,
  ) {}
  // ... rest of the service
}