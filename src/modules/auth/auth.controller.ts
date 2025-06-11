import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@ApiTags('Auth')
@Controller('auth')
@ApiHeader({
  name: 'x-api-key',
  description: 'API Key',
  required: true,
  schema: {
    type: 'string',
    example: 'your-api-key-12345'
  }
})
@UseGuards(ApiKeyGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate user and return JWT token'
  })
  @ApiBody({
    type: LoginDto,
    schema: {
      properties: {
        email: {
          type: 'string',
          description: 'User email address',
          example: 'user@example.com'
        },
        password: {
          type: 'string',
          description: 'User password',
          example: 'securepassword123'
        }
      },
      required: ['email', 'password']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Login successful' },
        data: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiJ9...' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid credentials' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
    description: 'Create a new user account'
  })
  @ApiBody({
    type: RegisterDto,
    schema: {
      properties: {
        email: {
          type: 'string',
          description: 'User email address',
          example: 'user@example.com'
        },
        password: {
          type: 'string',
          description: 'User password',
          example: 'securepassword123'
        },
        firstName: {
          type: 'string',
          description: 'First name',
          example: 'John'
        },
        lastName: {
          type: 'string',
          description: 'Last name',
          example: 'Doe'
        }
      },
      required: ['email', 'password', 'firstName', 'lastName']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: { type: 'string', example: 'User registered successfully' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: '64f123456789abcdef123456' },
            email: { type: 'string', example: 'user@example.com' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}