import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletAccountDocument = WalletAccount & Document;

@Schema({ timestamps: true })
export class WalletAccount {
  @Prop({ type: Types.ObjectId, ref: 'WalletUser', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  accountNumber: string;

  @Prop({ default: 0, min: 0 })
  balance: number;

  @Prop({ default: 'NGN' })
  currency: string;

  @Prop({ default: 'active', enum: ['active', 'suspended', 'closed'] })
  status: string;

  @Prop({ type: [Types.ObjectId], ref: 'WalletTransaction', default: [] })
  transactions: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'WalletBeneficiary', default: [] })
  beneficiaries: Types.ObjectId[];

  @Prop({ default: 0 })
  totalDeposits: number;

  @Prop({ default: 0 })
  totalWithdrawals: number;

  @Prop({ default: 0 })
  totalTransfers: number;

  @Prop()
  lastTransactionDate: Date;
}

export const WalletAccountSchema = SchemaFactory.createForClass(WalletAccount);
