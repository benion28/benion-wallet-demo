import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { TransactionStatus, TransactionType } from '../enums/transaction-type.enum';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true, type: String })
  walletId: string;

  @Prop({ 
    required: true, 
    enum: Object.values(TransactionType),
    type: String
  })
  type: TransactionType;

  @Prop({ 
    required: true, 
    enum: Object.values(TransactionStatus),
    type: String
  })
  status: TransactionStatus;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ type: String })
  reference?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);