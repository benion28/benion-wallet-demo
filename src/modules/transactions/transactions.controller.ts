// src/modules/transactions/transactions.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, Query, Request, Delete, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Logger } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service';
import { CustomApiResponse } from '../../common/interfaces/api-response.interface';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly walletService: WalletService
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new transaction',
    description: 'Create a new transaction record (admin only)'
  })
  @ApiBody({
    type: CreateTransactionDto,
    schema: {
      properties: {
        walletId: {
          type: 'string',
          description: 'ID of the wallet',
          example: '64f123456789abcdef123456'
        },
        amount: {
          type: 'number',
          description: 'Transaction amount',
          example: 100.00
        },
        type: {
          type: 'string',
          description: 'Transaction type (DEPOSIT, WITHDRAWAL, TRANSFER)',
          example: 'DEPOSIT'
        },
        description: {
          type: 'string',
          description: 'Transaction description',
          example: 'Monthly salary deposit'
        }
      },
      required: ['walletId', 'amount', 'type']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Transaction created successfully' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f123456789abcdef123456' },
            walletId: { type: 'string', example: '64f123456789abcdef123456' },
            amount: { type: 'number', example: 100.00 },
            type: { type: 'string', example: 'DEPOSIT' },
            description: { type: 'string', example: 'Monthly salary deposit' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
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
  @ApiResponse({
    status: 404,
    description: 'Wallet not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Wallet not found' },
        error: { type: 'string', example: 'Wallet does not exist' }
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Failed to create transaction' },
        error: { type: 'string', example: 'Internal server error' }
      }
    }
  })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req: any
  ) {
    return await this.transactionsService.handleCreate(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({ status: 200, description: 'Return all transactions' })
  async findAll(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('userId') userId?: string
  ) {
    if (req.user.roles.includes(UserRole.ADMIN)) {
      return await this.transactionsService.findAllPaginated(page, limit, userId)
      // return await this.transactionsService.findAll()
    }
    // return await this.transactionsService.findAllUserPaginated(page, limit, req.user.id)
    return await this.transactionsService.findByUserId(req.user.id)
  }
  
  // If you want to add pagination support:
  // async findAll(
  //   @Query('page') page: number = 1,
  //   @Query('limit') limit: number = 10,
  //   @Query('userId') userId?: string
  // ) {
  //   return this.transactionsService.findAllPaginated(page, limit, userId);
  // }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Return transaction by ID' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return await this.transactionsService.handleFindOne(id, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Delete transaction by ID' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully', })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return await this.transactionsService.handleDelete(id, req.user);
  }
}