import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true, type: String })
  userId: string;

  @Prop({ required: true, type: String })
  reference: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'success', 'failed'] 
  })
  status: string;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    default: {}
  })
  metadata: Record<string, any>;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);