import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { Transaction } from './schemas/transaction.schema';
import { VerifyTransactionResponseDto } from './dto/verify-transaction.response.dto';
import { WalletService } from '../wallet/wallet.service';
import { forwardRef } from '@nestjs/common';
import { ApiResponse } from '../../common/utils/api-response.util';
import { Wallet } from '../wallet/schemas/wallet.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService
  ) {}

  async createPending(userId: string, reference: string, amount: number, metadata = {}) {
    const transaction = new this.transactionModel({ userId, reference, amount, status: 'pending', metadata });
    return transaction.save();
  }

  async updateStatus(reference: string, status: 'success' | 'failed') {
    return this.transactionModel.findOneAndUpdate({ reference }, { status }, { new: true });
  }

  async findByReference(reference: string) {
    return this.transactionModel.findOne({ reference });
  }

  async findByWalletId(userId: string) {
    const wallet = await this.walletService.findByWalletUser(userId);
    if (!wallet) {
      return ApiResponse.error({
        status: 404,
        message: 'User Wallet not found',
        error: 'User Wallet not found'
      });
    }
    return wallet;
  }

  // Add this method
  async findOne(idOrFilter: string | any): Promise<Transaction | null> {
    if (typeof idOrFilter === 'string') {
      return this.transactionModel.findById(idOrFilter).exec();
    }
    return this.transactionModel.findOne(idOrFilter).exec();
  }

  // Add this method for creating transactions
  async create(createTransactionDto: any) {
    const transaction = new this.transactionModel(createTransactionDto);
    return transaction.save();
  }

  // Add these methods
  async findByUserId(userId: string) {
    try {
      // First get the wallet for this user
      const wallet = await this.findByWalletId(userId);
      
      if (!wallet) {
        return ApiResponse.error({
          status: 404,
          message: 'Wallet not found',
          error: 'Wallet not found'
        });
      }
      
      // Then find transactions for this wallet
      const walletDoc = wallet as Document & Wallet;
      const transactions = await this.transactionModel.find({ walletId: walletDoc._id });
  
      if (!transactions) {
        return ApiResponse.success({
          status: 200,
          message: 'No transactions found',
          data: []
        });
      }
  
      return ApiResponse.success({
        status: 200,
        message: 'Transactions retrieved successfully',
        data: transactions
      });
    } catch (error) {
      console.error('Error finding transactions:', error);
      return ApiResponse.error({
        status: error.status || 500,
        message: error.message || 'Failed to retrieve transactions',
        error: error.name
      });
    }
  }

  async delete(id: string) {
    const transaction = await this.findOne(id);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    
    await this.transactionModel.findByIdAndDelete(id);
    return transaction;
  }

  async findAll() {
    return ApiResponse.success({
      status: 200,
      message: 'Transactions retrieved successfully',
      data: this.transactionModel.find().sort({ createdAt: -1 })
    });
  }

  // Add pagination method if needed
  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    userId?: string
  ) {
    const query = userId ? { walletId: userId } : {};
    const total = await this.transactionModel.countDocuments(query);
    const transactions = await this.transactionModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return ApiResponse.success({
      status: 200,
      message: 'Transactions retrieved successfully',
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  }

  async findAllUserPaginated(
    page: number = 1,
    limit: number = 10,
    userId?: string
  ) {
    const query = userId ? { walletId: userId } : {};
    console.log("query", query);
    const total = await this.transactionModel.countDocuments(query);
    const transactions = await this.transactionModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return ApiResponse.success({
      status: 200,
      message: 'Transactions retrieved successfully',
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  }

  async verifyFunding(reference: string): Promise<VerifyTransactionResponseDto> {
    const transaction = await this.findOne({ reference });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return {
      status: transaction.status,
      amount: transaction.amount,
      date: transaction.createdAt.toISOString(),
      description: transaction.description
    };
  }

  // Add other transaction methods as needed
}
