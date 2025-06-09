import { Controller, Post, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiHeader({ name: 'x-api-key', required: true })
  async login(@Headers('x-api-key') apiKey: string) {
    if (!(await this.authService.validateUser(apiKey))) {
      throw new UnauthorizedException('Invalid API key');
    }
    // Mock user id for demo
    const token = await this.authService.generateToken('user-id-123');
    return { access_token: token };
  }
}
