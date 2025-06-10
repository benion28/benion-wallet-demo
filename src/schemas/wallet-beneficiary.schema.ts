import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletBeneficiaryDocument = WalletBeneficiary & Document;

export enum BeneficiaryType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  BILL = 'bill',
}

@Schema({ timestamps: true })
export class WalletBeneficiary {
  @Prop({ type: Types.ObjectId, ref: 'WalletUser', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WalletAccount', required: true })
  accountId: Types.ObjectId;

  @Prop({ required: true, enum: Object.values(BeneficiaryType) })
  type: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  bankName: string;

  @Prop()
  bankCode: string;

  @Prop()
  accountNumber: string;

  @Prop()
  accountName: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  transferCount: number;

  @Prop()
  lastTransferredAt: Date;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const WalletBeneficiarySchema = SchemaFactory.createForClass(WalletBeneficiary);
