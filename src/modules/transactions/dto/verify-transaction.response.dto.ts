import { ApiProperty } from '@nestjs/swagger';

export class VerifyTransactionResponseDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  date: string;

  @ApiProperty()
  description: string;
}