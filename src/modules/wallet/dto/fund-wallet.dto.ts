import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString } from 'class-validator';

export class FundWalletDto {
  @ApiProperty({ description: 'Amount to fund the wallet', example: 1000 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ 
    description: 'Unique reference for the transaction', 
    example: 'TXN-1234567890'
  })
  @IsString()
  reference: string;
}