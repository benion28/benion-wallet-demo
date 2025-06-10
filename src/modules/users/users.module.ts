// src/modules/users/users.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletUser, WalletUserSchema } from '../../schemas/wallet-user.schema';
import { WalletUserService } from './wallet-user.service';
import { WalletUserController } from './wallet-user.controller';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WalletUser.name, schema: WalletUserSchema }]),
    forwardRef(() => AuthModule),
    forwardRef(() => WalletModule),
  ],
  controllers: [WalletUserController],
  providers: [WalletUserService],
  exports: [WalletUserService], // Make sure to export the service
})
export class UsersModule {}