import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { TransactionStatus, TransactionType } from '../enums/transaction-type.enum';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'Wallet', 
    required: true 
  })
  walletId: Types.ObjectId;

  @Prop({ 
    type: String, 
    required: true, 
    enum: Object.values(TransactionType)
  })
  type: TransactionType;

  @Prop({ 
    type: Number, 
    required: true, 
    min: 0.01 
  })
  amount: number;

  @Prop({ 
    type: String, 
    required: true 
  })
  description: string;

  @Prop({ 
    type: String, 
    required: true, 
    enum: Object.values(TransactionStatus)
  })
  status: TransactionStatus;

  @Prop({ 
    type: String, 
    unique: true, 
    required: false 
  })
  reference: string;

  @Prop({ 
    type: Object 
  })
  metadata?: Record<string, any>;

  // Explicitly define timestamps
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);