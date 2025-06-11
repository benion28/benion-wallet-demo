// src/modules/wallet/wallet.service.ts
import { Injectable, Inject, forwardRef, Logger, ConflictException, NotFoundException, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wallet } from './schemas/wallet.schema';
import { TransactionsService } from '../transactions/transactions.service';
import { BillsService } from '../bills/bills.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { TransactionStatus } from '../transactions/enums/transaction-type.enum';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { CustomApiResponse } from '../../common/interfaces/api-response.interface';
import { UserRole } from '../auth/enums/user-role.enum';
@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService,
    @Inject(forwardRef(() => BillsService))
    private readonly billsService: BillsService
    
  ) {}
  
  async findByWalletId(walletId: string) {
    return this.walletModel.findById(walletId).exec();
  }

  async findByWalletUser(userId: string) {
    try {
      const wallet = await this.walletModel.findOne({ userId }).exec();
      if (!wallet) {
        throw new NotFoundException(`Wallet not found for user ${userId}`);
      }
      return wallet;
    } catch (error) {
      this.logger.error(`Error finding wallet for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deductAmount(userId: string, amount: number, transactionId: string): Promise<void> {
    try {
      const wallet = await this.walletModel.findOneAndUpdate(
        { userId },
        { $inc: { balance: -amount } },
        { new: true }
      ).exec();

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // Create transaction record
      await this.transactionsService.create({
        userId,
        amount,
        status: 'pending',
        type: 'debit',
        metadata: { transactionId }
      });

    } catch (error) {
      this.logger.error(`Error deducting amount from wallet: ${error.message}`, error.stack);
      throw error;
    }
  }

  async addAmount(userId: string, amount: number, transactionId: string): Promise<void> {
    try {
      const wallet = await this.walletModel.findOneAndUpdate(
        { userId },
        { $inc: { balance: amount } },
        { new: true }
      ).exec();

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // Create transaction record
      await this.transactionsService.create({
        userId,
        amount,
        status: 'success',
        type: 'credit',
        metadata: { transactionId }
      });

    } catch (error) {
      this.logger.error(`Error adding amount to wallet: ${error.message}`, error.stack);
      throw error;
    }
  }

  async create(createWalletDto: CreateWalletDto) {
    try {
      // Check if wallet already exists for this user
      const existingWallet = await this.walletModel.findOne({ 
        userId: createWalletDto.userId 
      }).exec();

      if (existingWallet) {
        return CustomApiResponse.error({
          status: 409,
          message: 'User already has a wallet',
          error: 'User already has a wallet'
        });
      }

      // Set default values if not provided
      const walletData = {
        balance: 0,
        currency: 'NGN',
        ...createWalletDto,
      };
      
      const wallet = new this.walletModel(walletData);
      wallet.save();
      
      return CustomApiResponse.success({
        status: 201,
        message: 'Wallet created successfully',
        data: wallet
      });
    } catch (error) {
      this.logger.error(`Error creating wallet: ${error.message}`, error.stack);
      // If it's a duplicate key error (MongoDB error code 11000)
      if (error.code === 11000) {
        return CustomApiResponse.error({
          status: 409,
          message: 'User already has a wallet',
          error: 'User already has a wallet'
        });
      }
    }
  }

    // Add a method to get or create wallet
    async getOrCreateWallet(userId: string) {
      try {
        let wallet = await this.findByWalletUser(userId);
        if (!wallet) {
          wallet = new this.walletModel({ userId, balance: 0 });
          await wallet.save();
        }
        return wallet;
      } catch (error) {
        this.logger.error(`Error in getOrCreateWallet: ${error.message}`, error.stack);
        throw error;
      }
    }

  async fundWallet(userId: string, fundDto: FundWalletDto) {
    try {
      const wallet = await this.walletModel.findOne({ userId }).exec();
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }
  
      // Create transaction with pending status
      const transaction = await this.transactionsService.create({
        walletId: wallet._id,
        type: 'credit',
        amount: fundDto.amount,
        description: 'Wallet funding',
        status: TransactionStatus.PENDING,
        reference: fundDto.reference,
      });
  
      // Update wallet balance
      const updatedWallet = await this.walletModel.findByIdAndUpdate(
        wallet._id,
        { $inc: { balance: fundDto.amount } },
        { new: true }
      );
  
      if (!updatedWallet) {
        throw new HttpException('Failed to update wallet balance', HttpStatus.INTERNAL_SERVER_ERROR);
      }
  
      // Only update transaction status if balance update was successful
      transaction.status = TransactionStatus.COMPLETED;
      await transaction.save();
  
      return {
        transactionId: transaction._id,
        amount: fundDto.amount,
        balance: updatedWallet.balance
      };
    } catch (error) {
      // If there's an error, update transaction status to failed
      if (error instanceof Error) {
        await this.transactionsService.updateStatus(fundDto.reference, TransactionStatus.FAILED);
      }
      throw error; // Let NestJS handle the error
    }
  }

  async verifyFunding(reference: string) {
    const transaction = await this.transactionsService.findOne({ reference });
    if (!transaction) {
      return CustomApiResponse.error({
        status: 404,
        message: 'Transaction not found',
        error: 'Transaction not found'
      });
    }

    return CustomApiResponse.success({
      message: 'Transaction verified successfully',
      data: {
        status: transaction.status,
        amount: transaction.amount,
        date: transaction.createdAt,
        description: transaction.description
      }
    });
  }

  async getBalance(userId: string) {
    const wallet = await this.walletModel.findOne({ userId }).exec();
    if (!wallet) {
      return CustomApiResponse.error({
        status: 404,
        message: 'Wallet not found',
        error: 'Wallet not found'
      });
    }
    return CustomApiResponse.success({
      status: 200,
      message: 'Wallet balance retrieved successfully',
      data: wallet.balance
    });
  }

  async findAllAll(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      
      const [wallets, total] = await Promise.all([
        this.walletModel.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        this.walletModel.countDocuments()
      ]);

      return CustomApiResponse.success({
        data: wallets,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(userId: string, page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      
      const [wallets, total] = await Promise.all([
        this.walletModel.find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        this.walletModel.countDocuments({ userId })
      ]);

      return {
        wallets,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      return {
        status: error.status || 500,
        message: error.message,
        error: error.name
      };
    }
  }

  async deleteUserWallet(orIdFilter: string, req: any) {
    const userId = req.user.role.includes(UserRole.ADMIN) ? orIdFilter : req.user.sub;
    const wallet = await this.walletModel.findOne({ userId });
    if (!wallet) {
      return CustomApiResponse.error({
        status: 404,
        message: 'Wallet not found',
        error: 'Wallet not found'
      });
    }
    await this.walletModel.deleteOne({ userId });
    return CustomApiResponse.success({
      status: 200,
      message: 'Wallet deleted successfully',
      data: wallet
    });
  }

  async deleteWallet(req: any) {
    const wallet = await this.walletModel.findOneAndDelete({ userId: req.user.sub });
    if (!wallet) {
      return {
        status: 404,
        message: 'Wallet not found',
        error: 'Wallet not found'
      };
    }
    return null;
  }
}
