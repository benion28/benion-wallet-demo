import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { WalletModule } from '../wallet/wallet.module';  // Import WalletModule
import { LocalStrategy } from './stragies/local.strategy';
import { JwtStrategy } from './stragies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    WalletModule,  // Import WalletModule here
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],  // Only export AuthService and JwtModule
})
export class AuthModule {}