// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { WalletUserService } from '../../users/wallet-user.service';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly walletUserService: WalletUserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.walletUserService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    const userData = user.toObject();
    return {
      _id: userData._id.toString(),
      email: userData.email,
      roles: userData.roles || [UserRole.USER]
    };
  }
}