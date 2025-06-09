import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './schemas/wallet.schema';
import { BillsModule } from '../bills/bills.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { AuthModule } from '../auth/auth.module';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }]),
    TransactionsModule,
    BillsModule,
    AuthModule, // Add AuthModule to provide JwtService
  ],
  providers: [WalletService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}
