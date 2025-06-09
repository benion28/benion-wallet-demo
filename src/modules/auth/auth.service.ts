import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateUser(apiKey: string): Promise<boolean> {
    // For login/register, use x-api-key validation here or delegate to a guard
    return apiKey === process.env.API_KEY;
  }

  async generateToken(userId: string) {
    return this.jwtService.sign({ sub: userId });
  }
}
