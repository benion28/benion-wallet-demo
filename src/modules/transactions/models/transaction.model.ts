import { Document } from 'mongoose';
import { TransactionStatus, TransactionType } from '../enums/transaction-type.enum';

export interface Transaction extends Document {
  _id: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  description: string;
  reference?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
