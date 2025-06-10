import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletUser, WalletUserSchema } from '../../schemas/wallet-user.schema';
import { WalletUserService } from './wallet-user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WalletUser.name, schema: WalletUserSchema },
    ]),
  ],
  providers: [WalletUserService],
  exports: [WalletUserService],
})
export class WalletUserModule {}