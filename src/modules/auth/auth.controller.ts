import { Controller, Post, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ApiKeyGuard } from './guards/api-key.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', required: true })
  @ApiResponse({ status: 200, description: 'Successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Headers('x-api-key') apiKey: string) {
    // The API key is already validated by the ApiKeyGuard
    // In a real app, you would validate the user's credentials here
    const userId = 'user-id-123'; // Replace with actual user lookup
    return this.authService.generateToken(userId);
  }

  @Post('register')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', required: true })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async register() {
    // Your registration logic here
    return { message: 'User registered successfully' };
  }
}
