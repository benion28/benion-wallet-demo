// src/modules/wallet/schemas/wallet.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Wallet extends Document {
  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true  // This ensures userId is unique
  })
  userId: Types.ObjectId;

  @Prop({ default: 0, min: 0 })
  balance: number;

  @Prop({ default: 'NGN' })
  currency: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);