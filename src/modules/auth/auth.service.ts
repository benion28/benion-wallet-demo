import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WalletUserService } from '../users/wallet-user.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateWalletUserDto } from '../users/dto/create-wallet-user.dto';
import { UserRole } from './enums/user-role.enum';
import { WalletService } from '../wallet/wallet.service';
import { CustomApiResponse } from '../../common/interfaces/api-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: WalletUserService,
    private jwtService: JwtService,
    private readonly walletService: WalletService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        return CustomApiResponse.error({
          error: 'Invalid credentials'
        });
      }

      const isPasswordValid = await bcrypt.compare(pass, user.password);
      if (!isPasswordValid) {
        return CustomApiResponse.error({
          error: 'Invalid credentials'
        });
      }

      const { password, ...result } = user;
      return CustomApiResponse.success({
        data: result
      });
    } catch (error) {
      console.error('Error validating user:', error);
      return CustomApiResponse.error({
        error: error.message || 'Authentication failed'
      });
    }
  }

  async login(loginDto: LoginDto) {
    try {
      // Find user by email
      const user = await this.usersService.findByEmail(loginDto.email);
      if (!user) {
        return CustomApiResponse.error({
          error: 'Invalid credentials'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        return CustomApiResponse.error({
          error: 'Invalid credentials'
        });
      }

      // Create JWT payload
      const payload = { 
        email: user.email, 
        sub: user._id.toString(),
        roles: user.roles || [UserRole.USER]  // Store roles as array
      };

      // Generate access token
      const accessToken = this.jwtService.sign(payload);
      
      // Return user data without password and with access token
      const { password, ...userData } = user.toObject();
      return CustomApiResponse.success({
        data: {
          accessToken,
          user: userData
        }
      });
    } catch (error) {
      console.error('Error in login:', error);
      return CustomApiResponse.error({
        error: error.message || 'Login failed'
      });
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      const existingUser = await this.usersService.findByEmail(registerDto.email);
      if (existingUser) {
        return CustomApiResponse.error({
          error: 'Email already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const userData: CreateWalletUserDto = {
        ...registerDto,
        password: hashedPassword,
        roles: [UserRole.USER]
      };

      const newUser = await this.usersService.create(userData);
      
      // Create wallet for the new user
      // await this.walletService.create({
      //   userId: newUser._id.toString(),
      //   balance: 0,
      //   currency: 'NGN'
      // });

      // Convert to plain object and remove password
      const { password, ...result } = newUser.toObject();
      return CustomApiResponse.success({
        data: result
      });
    } catch (error) {
      console.error('Registration error:', error);
      return CustomApiResponse.error({
        error: error.message || 'Registration failed'
      });
    }
  }
}