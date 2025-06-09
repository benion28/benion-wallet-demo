import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(apiKey: string): Promise<boolean> {
    // In a real app, you would validate the API key against your database
    return apiKey === this.configService.get<string>('API_KEY');
  }

  async generateToken(userId: string) {
    const payload = { userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
