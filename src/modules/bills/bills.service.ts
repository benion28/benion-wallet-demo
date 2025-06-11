import { Inject, Injectable, NotFoundException, Logger, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentGateway } from '../../common/interfaces/payment-gateway.interface';
import { Transaction } from '../transactions/models/transaction.model';
import { WalletService } from '../wallet/wallet.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { BillResponseDto } from './dto/bill-response.dto';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPattern, Ctx } from '@nestjs/microservices';
import { TransactionStatus, TransactionType } from '../transactions/enums/transaction-type.enum';
import { CustomApiResponse } from '../../common/interfaces/api-response.interface';

@Injectable()
export class BillsService {
  private readonly logger = new Logger(BillsService.name);

  constructor(
    @Inject('PAYMENT_GATEWAY') private readonly paymentGateway: PaymentGateway,
    @Inject(forwardRef(() => WalletService)) private readonly walletService: WalletService,
    @Inject(forwardRef(() => TransactionsService)) private readonly transactionsService: TransactionsService,
    @Inject(forwardRef(() => EventEmitter2)) private readonly eventEmitter: EventEmitter2,
    @InjectModel('Transaction') private readonly transactionModel: Model<Transaction>
  ) {
    this.logger.log('BillsService initialized');
  }

  async processBillPayment(userId: string, createBillDto: CreateBillDto) {
    try {
      // 1. Get user's wallet
      const wallet = await this.walletService.findByWalletUser(userId);
      if (!wallet) {
        return CustomApiResponse.error({
          status: 404,
          message: 'Wallet not found',
          error: 'Wallet not found'
        });
      }

      // 2. Check if wallet has sufficient balance
      if (wallet.balance < createBillDto.amount) {
        return CustomApiResponse.error({
          status: 400,
          message: 'Insufficient balance',
          error: 'Insufficient balance'
        });
      }

      // 3. Create pending transaction
      const transaction = await this.transactionsService.create({
        userId,
        amount: createBillDto.amount,
        type: TransactionType.BILL_PAYMENT,
        status: TransactionStatus.PENDING,
        reference: createBillDto?.billReference ? `${createBillDto.billReference}-${Date.now()}` : `TRX-${Date.now()}`,
        description : createBillDto?.description || 'Bill Payment',
        walletId: wallet._id.toString()
      });

      // 4. Deduct amount from wallet
      await this.walletService.deductAmount(userId, createBillDto.amount, transaction._id.toString());

      // 5. Process payment with external gateway
      const paymentResponse = await this.paymentGateway.processBillPayment({
        amount: createBillDto.amount,
        billReference: createBillDto.billReference,
        provider: createBillDto.provider,
        metadata: {
          userId,
          transactionId: transaction._id.toString()
        }
      });

      if (paymentResponse?.success) {
        // Update transaction status to success
        await this.transactionsService.updateStatus(transaction._id.toString(), 'success');

        // Emit payment success event
        this.eventEmitter.emit('bill.payment.status', {
          transactionId: transaction._id.toString(),
          status: TransactionStatus.SUCCESS,
          amount: createBillDto.amount,
          billReference: createBillDto.billReference,
          provider: createBillDto.provider
        });

        return CustomApiResponse.success({
          status: 200,
          message: 'Payment successful',
          data: {
            transactionId: transaction._id.toString(),
            status: TransactionStatus.SUCCESS,
            amount: createBillDto.amount,
            billReference: createBillDto.billReference,
            provider: createBillDto.provider,
            message: paymentResponse.message
          }
        });
      } else {
        // Emit payment failure event
        this.eventEmitter.emit('bill.payment.failure', {
          transactionId: transaction._id.toString(),
          error: paymentResponse?.message || 'Payment failed',
          amount: createBillDto.amount,
          billReference: createBillDto.billReference,
          provider: createBillDto.provider
        });

        return CustomApiResponse.error({
          status: 400,
          message: 'Payment failed',
          error: paymentResponse?.message || 'Payment failed'
        });
      }
    } catch (error) {
      // Handle failures by rolling back
      if (error?.transaction) {
        this.eventEmitter.emit('transaction.rollback', {
          transactionId: error.transaction._id.toString(),
          error: error.message,
          amount: createBillDto.amount,
          userId: userId
        });
      }

      return CustomApiResponse.error({
        status: 500,
        error: error.message || 'Bill payment failed. Your funds will be refunded shortly.'
      });
    }
  }

  async getPaymentStatus(transactionId: string, userId: string): Promise<BillResponseDto> {
    const transaction = await this.transactionModel
      .findById(transactionId)
      .where('userId', userId)
      .exec();

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return {
      transactionId,
      status: transaction.status,
      amount: transaction.amount,
      billReference: transaction.metadata.billReference,
      provider: transaction.metadata.provider,
      message: transaction.metadata.message
    } as BillResponseDto;
  }

  private async handlePaymentFailure(userId: string, error: Error): Promise<void> {
    try {
      // 1. Find the last pending transaction
      const transaction = await this.transactionModel
        .findOne({ userId, status: 'pending' })
        .sort({ createdAt: -1 })
        .exec();

      if (!transaction) {
        this.logger.warn('No pending transaction found for rollback');
        return;
      }

      // 2. Refund the amount back to wallet
      await this.walletService.addAmount(userId, transaction.amount, transaction._id.toString());

      // 3. Update transaction status to failed
      await this.transactionsService.updateStatus(transaction._id.toString(), 'failed');

      // 4. Log the failure
      this.logger.error(`Payment failed and rolled back: ${error.message}`, {
        transactionId: transaction._id.toString(),
        userId,
        amount: transaction.amount,
        error: error.message
      });

      // 5. Emit failure event
      this.eventEmitter.emit('bill.payment.failure', {
        transactionId: transaction._id,
        userId,
        amount: transaction.amount,
        error: error.message
      });

    } catch (rollbackError) {
      this.logger.error('Error during rollback:', rollbackError);
      // We don't want to throw here as we want to prevent error loops
      // This will be handled by monitoring system
    }
  }

  @EventPattern('bill.payment.failure')
  async handlePaymentFailureEvent(data: any) {
    // This is a background worker that handles failed transactions
    // It can retry the payment or notify the user
    try {
      // Implement retry logic here
      // Notify user about the failure
      // Log the failure for monitoring
      this.logger.error(`Payment failed for transaction ${data.transactionId}: ${data.error}`);
    } catch (error) {
      this.logger.error('Error handling failed payment:', error);
    }
  }
}