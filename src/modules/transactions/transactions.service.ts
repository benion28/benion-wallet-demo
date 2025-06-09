import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from './schemas/transaction.schema';

@Injectable()
export class TransactionsService {
  constructor(@InjectModel(Transaction.name) private transactionModel: Model<Transaction>) {}

  async createPending(userId: string, reference: string, amount: number, metadata = {}) {
    const transaction = new this.transactionModel({ userId, reference, amount, status: 'pending', metadata });
    return transaction.save();
  }

  async updateStatus(reference: string, status: 'success' | 'failed') {
    return this.transactionModel.findOneAndUpdate({ reference }, { status }, { new: true });
  }

  async findByReference(reference: string) {
    return this.transactionModel.findOne({ reference });
  }
}
