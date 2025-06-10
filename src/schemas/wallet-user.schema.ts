import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { UserRole } from '../modules/auth/enums/user-role.enum';

export type WalletUserDocument = WalletUser & Document;

@Schema({ timestamps: true })
export class WalletUser {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false }) // select: false to exclude by default
  password: string;

  @Prop({ trim: true })
  firstName?: string;

  @Prop({ trim: true })
  lastName?: string;

  @Prop({ trim: true })
  phoneNumber?: string;

  @Prop({ 
    type: [String], 
    enum: Object.values(UserRole),
    default: [UserRole.USER] 
  })
  roles: UserRole[];

  @Prop({ trim: true })
  profileImage?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const WalletUserSchema = SchemaFactory.createForClass(WalletUser);