import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletTransactionDocument = WalletTransaction & Document;

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  BILL_PAYMENT = 'bill_payment',
  AIRTIME = 'airtime',
  FUND_WALLET = 'fund_wallet',
}

@Schema({ timestamps: true })
export class WalletTransaction {
  @Prop({ type: Types.ObjectId, ref: 'WalletUser', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WalletAccount', required: true })
  accountId: Types.ObjectId;

  @Prop({ required: true, enum: Object.values(TransactionType) })
  type: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 0 })
  fee: number;

  @Prop({ required: true })
  reference: string;

  @Prop({ required: true, enum: Object.values(TransactionStatus), default: TransactionStatus.PENDING })
  status: string;

  @Prop()
  description: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'WalletUser' })
  recipientId: Types.ObjectId;

  @Prop()
  recipientAccountNumber: string;

  @Prop()
  recipientName: string;

  @Prop()
  recipientBank: string;

  @Prop()
  completedAt: Date;

  @Prop()
  failedReason: string;
}

export const WalletTransactionSchema = SchemaFactory.createForClass(WalletTransaction);
