import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({
    description: 'The ID of the user this wallet belongs to',
    example: '60d0fe4f5311236168a109ca',
  })
  @IsMongoId()
  userId: string;

  @ApiProperty({
    description: 'Initial balance of the wallet',
    example: 0,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  balance?: number;

  @ApiProperty({
    description: 'Currency code (e.g., NGN, USD)',
    example: 'NGN',
    default: 'NGN',
  })
  @IsString()
  @IsOptional()
  currency?: string;
}