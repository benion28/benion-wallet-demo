import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, HttpStatus, Request, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { CreateWalletUserDto } from './dto/create-wallet-user.dto';
import { WalletUserService } from './wallet-user.service';

import { UpdateWalletUserDto } from './dto/update-wallet-user.dto';
import { CustomApiResponse } from '../../common/interfaces/api-response.interface';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WalletUserController {
  constructor(private readonly walletUserService: WalletUserService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @SwaggerResponse({ status: 201, description: 'User created successfully' })
  @SwaggerResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createWalletUserDto: CreateWalletUserDto) {
    try {
      const user = await this.walletUserService.create(createWalletUserDto);
      return user;
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @SwaggerResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll() {
    try {
      const users = await this.walletUserService.findAll();
      return users;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get user by ID' })
  @SwaggerResponse({ status: 200, description: 'User retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    try {
      const userId = req.user.roles.includes(UserRole.ADMIN) ? id : req.user.sub;
      const user = await this.walletUserService.findOne(userId);
      if (!user) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
          error: 'NotFound'
        });
      }
      return CustomApiResponse.success({
        message: 'User retrieved successfully',
        status: 200,
        data: user
      });
    } catch (error) {
      return CustomApiResponse.error({
        message: 'User not found',
        status: 404,
        error: 'NotFound'
      });
    }
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update user' })
  @SwaggerResponse({ status: 200, description: 'User updated successfully' })
  @SwaggerResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateWalletUserDto: UpdateWalletUserDto,
    @Request() req: any
  ) {
    try {
      const userId = req.user.roles.includes(UserRole.ADMIN) ? id : req.user.sub;
      const user = await this.walletUserService.findOne(userId);
      
      if (!user) {
        return CustomApiResponse.error({
          message: 'User not found',
          status: 404,
          error: 'NotFound'
        });
      }
      const updatedUser = await this.walletUserService.update(userId, updateWalletUserDto);
      return CustomApiResponse.success({
        message: 'User updated successfully',
        status: 200,
        data: updatedUser
      });
    } catch (error) {
      return CustomApiResponse.error({
        message: 'User not found',
        status: 404,
        error: 'NotFound'
      });
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  @SwaggerResponse({ status: 200, description: 'User deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string, @Request() req: any) {
    try {
      const userId = req.user.roles.includes(UserRole.ADMIN) ? id : req.user.sub;
      const user = await this.walletUserService.findOne(userId);

      if (!user) {
        return CustomApiResponse.error({
          message: 'User not found',
          status: 404,
          error: 'NotFound'
        });
      }
      
      await this.walletUserService.remove(userId);
      return CustomApiResponse.success({
        message: 'User deleted successfully',
        status: 200,
        data: null
      });
    } catch (error) {
      return CustomApiResponse.error({
        message: 'User not found',
        status: 404,
        error: 'NotFound'
      });
    }
  }
}