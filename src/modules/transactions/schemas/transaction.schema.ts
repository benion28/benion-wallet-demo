import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  reference: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'pending', enum: ['pending', 'success', 'failed'] })
  status: string;

  @Prop()
  metadata: any;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);