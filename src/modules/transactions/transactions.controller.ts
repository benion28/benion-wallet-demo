// src/modules/transactions/transactions.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, Query, Request, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ApiResponse } from '../../common/utils/api-response.util';
import { Transaction } from './schemas/transaction.schema';
import { Logger } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service';

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
  @ApiOperation({ summary: 'Create a new transaction' })
  @SwaggerApiResponse({ status: 201, description: 'Transaction created successfully' })
  @SwaggerApiResponse({ status: 400, description: 'Bad Request' })
  @SwaggerApiResponse({ status: 404, description: 'Wallet not found' })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req: any
  ) {
    try {
      // Validate wallet exists
      const wallet = await this.walletService.findByWalletId(createTransactionDto.walletId);
      if (!wallet) {
        return ApiResponse.error({
          status: 404,
          message: 'Wallet not found',
          error: 'Wallet does not exist'
        });
      }

      // Create transaction
      const transaction = await this.transactionsService.create(createTransactionDto);

      return ApiResponse.success({
        status: 201,
        message: 'Transaction created successfully',
        data: transaction
      });
    } catch (error) {
      this.logger.error(`Error creating transaction: ${error.message}`, error.stack);
      return ApiResponse.error({
        status: 400,
        message: 'Failed to create transaction',
        error: error.message
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @SwaggerApiResponse({ status: 200, description: 'Return all transactions' })
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
  @SwaggerApiResponse({ status: 200, description: 'Return transaction by ID' })
  @SwaggerApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    try {
      const transaction = await this.transactionsService.findOne(id);
      
      // If not admin, ensure user can only access their own transactions
      const wallet = await this.walletService.findByWalletId(transaction.walletId.toString());
      const walletUserId = wallet.userId.toString();
      const userId = req.user.id.toString();
      if (!req.user.roles.includes(UserRole.ADMIN) && walletUserId !== userId) {
        return ApiResponse.error({
          status: 404,
          message: 'Transaction not found',
          error: 'Transaction does not exist'
        });
      }

      if (!transaction) {
        return ApiResponse.error({
          status: 404,
          message: 'Transaction not found',
          error: 'Transaction does not exist'
        });
      }

      return ApiResponse.success({
        status: 200,
        message: 'Transaction retrieved successfully',
        data: transaction
      });
    } catch (error) {
      this.logger.error(`Error fetching transaction: ${error.message}`, error.stack);
      return ApiResponse.error({
        status: 500,
        message: 'Failed to fetch transaction',
        error: error.message
      });
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Delete transaction by ID' })
  @SwaggerApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @SwaggerApiResponse({ status: 404, description: 'Transaction not found' })
  async delete(@Param('id') id: string, @Request() req: any) {
    try {
      // First find the transaction to validate it exists
      const transaction = await this.transactionsService.findOne(id);
      
      if (!transaction) {
        return ApiResponse.error({
          status: 404,
          message: 'Transaction not found',
          error: 'Transaction does not exist'
        });
      }

      // Delete the transaction
      const deletedTransaction = await this.transactionsService.delete(id);
      
      if (!deletedTransaction) {
        return ApiResponse.error({
          status: 404,
          message: 'Transaction not found',
          error: 'Transaction was not deleted'
        });
      }

      return ApiResponse.success({
        status: 200,
        message: 'Transaction deleted successfully',
        data: null
      });
    } catch (error) {
      this.logger.error(`Error deleting transaction: ${error.message}`, error.stack);
      return ApiResponse.error({
        status: 500,
        message: 'Failed to delete transaction',
        error: error.message
      });
    }
  }
}