import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletBillPaymentDocument = WalletBillPayment & Document;

export enum BillPaymentStatus {
  PENDING = 'pending',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  PROCESSING = 'processing',
}

export enum BillType {
  AIRTIME = 'airtime',
  DATA = 'data',
  ELECTRICITY = 'electricity',
  CABLE_TV = 'cable_tv',
  INTERNET = 'internet',
  EDUCATION = 'education',
}

@Schema({ timestamps: true })
export class WalletBillPayment {
  @Prop({ type: Types.ObjectId, ref: 'WalletUser', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WalletAccount', required: true })
  accountId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WalletTransaction' })
  transactionId: Types.ObjectId;

  @Prop({ required: true })
  reference: string;

  @Prop({ required: true, enum: Object.values(BillType) })
  billType: string;

  @Prop({ required: true })
  billerName: string;

  @Prop({ required: true })
  billerCode: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 0 })
  fee: number;

  @Prop({ required: true, enum: Object.values(BillPaymentStatus), default: BillPaymentStatus.PENDING })
  status: string;

  @Prop()
  paymentDate: Date;

  @Prop()
  dueDate: Date;

  @Prop()
  description: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ type: Object })
  providerResponse: Record<string, any>;

  @Prop()
  providerReference: string;

  @Prop()
  provider: string;

  @Prop()
  failedReason: string;
}

export const WalletBillPaymentSchema = SchemaFactory.createForClass(WalletBillPayment);
