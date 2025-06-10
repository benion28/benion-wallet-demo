import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, HttpStatus, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { CreateWalletUserDto } from './dto/create-wallet-user.dto';
import { WalletUserService } from './wallet-user.service';
import { ApiResponse } from '../../common/utils/api-response.util';
import { UpdateWalletUserDto } from './dto/update-wallet-user.dto';

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
      return ApiResponse.success({
        status: HttpStatus.CREATED,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      return ApiResponse.error({
        status: error.status || HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to create user',
        error: error.name || 'BadRequest'
      });
    }
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @SwaggerResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll() {
    try {
      const users = await this.walletUserService.findAll();
      return ApiResponse.success({
        status: HttpStatus.OK,
        message: 'Users retrieved successfully',
        data: users
      });
    } catch (error) {
      return ApiResponse.error({
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to retrieve users',
        error: error.name || 'InternalServerError'
      });
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get user by ID' })
  @SwaggerResponse({ status: 200, description: 'User retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    try {
      const userId = req.user.roles.includes(UserRole.ADMIN) ? id : req.user.id;
      const user = await this.walletUserService.findOne(userId);
      if (!user) {
        return ApiResponse.error({
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
          error: 'NotFound'
        });
      }
      return ApiResponse.success({
        status: HttpStatus.OK,
        message: 'User retrieved successfully',
        data: user
      });
    } catch (error) {
      return ApiResponse.error({
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to retrieve user',
        error: error.name || 'InternalServerError'
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
      const userId = req.user.roles.includes(UserRole.ADMIN) ? id : req.user.id;
      const user = await this.walletUserService.update(userId, updateWalletUserDto);
      if (!user) {
        return ApiResponse.error({
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
          error: 'NotFound'
        });
      }
      return ApiResponse.success({
        status: HttpStatus.OK,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      return ApiResponse.error({
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to update user',
        error: error.name || 'InternalServerError'
      });
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  @SwaggerResponse({ status: 200, description: 'User deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    try {
      await this.walletUserService.remove(id);
      return ApiResponse.success({
        status: 200,
        message: 'User deleted successfully',
        data: null,
      });
    } catch (error) {
      return ApiResponse.error({
        status: error.status || 500,
        message: error.message || 'Failed to delete user',
        error: error.name,
      });
    }
  }
}