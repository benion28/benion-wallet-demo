import { Controller, Post, Get, Body, Param, Request, UseGuards, Query, Delete } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ApiResponse } from '../../common/utils/api-response.util';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { UserRole } from '../auth/enums/user-role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all wallets' })
  @SwaggerResponse({
    status: 200,
    description: 'List of wallets with pagination',
    schema: {
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            wallets: { type: 'array', items: { $ref: '#/components/schemas/Wallet' } },
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' }
          }
        }
      }
    }
  })
  @SwaggerResponse({
    status: 401,
    description: 'User is not authenticated'
  })
  @SwaggerResponse({
    status: 403,
    description: 'User is not authorized to view all wallets'
  })
  async findAll(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    try {
      // Regular user can only see their own wallets
      const response = await this.walletService.findAllAll(+page, +limit, req);
      // const wallets = await this.walletService.findAll(req.user.userId, +page, +limit);
      
      // Handle both possible response types
      const data = 'wallets' in response ? response : response.data;
      
      return ApiResponse.success({
        status: 200,
        message: 'Wallets retrieved successfully',
        data: data.wallets,
        pagination: {
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages
        }
      });
    } catch (error) {
      return ApiResponse.error({
        status: error.status || 500,
        message: error.message,
        error: error.name
      });
    }
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new wallet' })
  @SwaggerResponse({
    status: 201,
    description: 'Wallet created successfully',
    schema: {
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            currency: { type: 'string' },
            name: { type: 'string' },
            balance: { type: 'number' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        }
      }
    }
  })
  @SwaggerResponse({
    status: 400,
    description: 'Bad Request'
  })
  async create(
    @Request() req: any,
    @Body() createWalletDto: CreateWalletDto
  ) {
    try {
      const wallet = await this.walletService.create(createWalletDto);
      return ApiResponse.success({
        status: 201,
        message: 'Wallet created successfully',
        data: wallet
      });
    } catch (error) {
      return ApiResponse.error({
        status: error.status || 400,
        message: error.message,
        error: error.name
      });
    }
  }

  @Post('fund')
  @ApiOperation({ summary: 'Fund wallet with specified amount' })
  @SwaggerResponse({ status: 200, description: 'Wallet funded successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid amount' })
  @SwaggerResponse({ status: 404, description: 'Wallet not found' })
  async fund(@Body() fundDto: any, @Request() req: any) {
    try {
      const data: FundWalletDto = {
        amount: fundDto.amount,
        reference: fundDto.reference || `TXN-${Date.now().toString()}`
      }
      const result = await this.walletService.fundWallet(req.user.sub, data);
      return ApiResponse.success({
        status: 200,
        message: 'Wallet funded successfully',
        data: result
      });
    } catch (error) {
      return ApiResponse.error({
        status: error.status || 400,
        message: error.message,
        error: error.name
      });
    }
  }

  @Get('verify/:reference')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Verify wallet funding status' })
  @SwaggerResponse({ status: 200, description: 'Funding verified' })
  @SwaggerResponse({ status: 404, description: 'Transaction not found' })
  async verify(@Param() verifyDto: any) {
    try {
      const result = await this.walletService.verifyFunding(verifyDto.reference);
      return ApiResponse.success({
        status: 200,
        message: 'Funding verified successfully',
        data: result
      });
    } catch (error) {
      return ApiResponse.error({
        status: error.status || 404,
        message: error.message,
        error: error.name
      });
    }
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @SwaggerResponse({ status: 200, description: 'Balance retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Wallet not found' })
  async getBalance(@Request() req: any) {
    try {
      const balance = await this.walletService.getBalance(req.user.sub);
      return ApiResponse.success({
        status: 200,
        message: 'Balance retrieved successfully',
        data: { balance }
      });
    } catch (error) {
      return ApiResponse.error({
        status: error.status || 404,
        message: error.message,
        error: error.name
      });
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete wallet' })
  @SwaggerResponse({ status: 200, description: 'Wallet deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Wallet not found' })
  async delete(@Request() req: any, @Param('id') id: string) {
    try {
      const wallet = await this.walletService.deleteUserWallet(id, req);
      return ApiResponse.success({
        status: 200,
        message: 'Wallet deleted successfully',
        data: wallet
      });
    } catch (error) {
      return ApiResponse.error({
        status: error.status || 404,
        message: error.message,
        error: error.name
      });
    }
  }
}
