import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WalletUserService } from '../users/wallet-user.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { CreateWalletUserDto } from '../users/dto/create-wallet-user.dto';
import { UserRole } from './enums/user-role.enum';

import { WalletService } from '../wallet/wallet.service';

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
        return null;
      }

      const isPasswordValid = await bcrypt.compare(pass, user.password);
      if (!isPasswordValid) {
        return null;
      }

      const { password, ...result } = user.toObject();
      return result;
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }

  async login(user: any) {
    try {
      if (!user || !user._id) {
        throw new UnauthorizedException('Invalid user data');
      }

      const payload = { 
        email: user.email, 
        sub: user._id,
        roles: user.roles || [UserRole.USER]
      };

      const tokenData = {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles || [UserRole.USER]
        }
      };

      return tokenData;
    } catch (error) {
      console.error('Login error:', error);
      throw new UnauthorizedException('Login failed: ' + error.message);
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const rawPassword = registerDto.password;
      
      // Create a new CreateWalletUserDto with the hashed password
      const createUserDto: CreateWalletUserDto = {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phoneNumber: registerDto.phoneNumber,
        roles: registerDto.roles || [UserRole.USER] // Default to user role
      };

      // Create and save the user
      const savedUser = await this.usersService.create(createUserDto);
      
      // Create wallet for the new user
      await this.walletService.getOrCreateWallet(savedUser._id.toString());
      
      return {
        ...savedUser,
        password: rawPassword
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new BadRequestException('Registration failed: ' + error.message);
    }
  }
}