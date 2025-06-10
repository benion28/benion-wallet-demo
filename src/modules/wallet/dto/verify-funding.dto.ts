import { ApiProperty } from '@nestjs/swagger';

export class VerifyFundingDto {
  @ApiProperty({ description: 'Payment reference', example: 'PAY-123456' })
  reference: string;
}