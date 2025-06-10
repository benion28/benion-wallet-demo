// src/modules/transactions/dto/create-transaction.dto.ts
import { IsNumber, IsString, IsEnum, IsPositive } from 'class-validator';
import { TransactionStatus, TransactionType } from '../enums/transaction-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Wallet ID', example: '6482e6b0e1b8f00001234567' })
  @IsString()
  walletId: string;

  @ApiProperty({ description: 'Transaction type', example: 'credit' })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ description: 'Transaction amount', example: 1000 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Transaction description', example: 'Wallet funding' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Transaction status', example: 'pending' })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @ApiProperty({ description: 'Unique transaction reference', example: 'TXN-123456' })
  @IsString()
  reference: string;
}