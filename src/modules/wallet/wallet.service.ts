import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet } from './schemas/wallet.schema';
import { Model } from 'mongoose';
import { TransactionsService } from '../transactions/transactions.service';
import { BillsService } from '../bills/bills.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    private readonly transactionsService: TransactionsService,
    private readonly billsService: BillsService,
  ) {}

  async getOrCreateWallet(userId: string) {
    let wallet = await this.walletModel.findOne({ userId });
    if (!wallet) {
      wallet = new this.walletModel({ userId, balance: 0 });
      await wallet.save();
    }
    return wallet;
  }

  async fundWallet(userId: string, amount: number) {
    const txData = await this.billsService.initializePayment({
      amount: amount * 100, // Paystack expects amount in kobo
      email: `${userId}@example.com`,
    });
    await this.transactionsService.createPending(userId, txData.data.reference, amount);
    return txData.data.authorization_url;
  }

  async verifyFunding(reference: string) {
    const tx = await this.transactionsService.findByReference(reference);
    if (!tx) throw new NotFoundException('Transaction not found');

    const result = await this.billsService.verifyPayment(reference);
    if (result.data.status === 'success') {
      await this.walletModel.updateOne({ userId: tx.userId }, { $inc: { balance: tx.amount } });
      await this.transactionsService.updateStatus(reference, 'success');
    } else {
      await this.transactionsService.updateStatus(reference, 'failed');
    }
    return result.data;
  }

  async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return { balance: wallet.balance };
  }
}
