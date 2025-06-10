import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateBillDto {
  @IsNotEmpty()
  @IsString()
  billReference: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsString()
  provider: string;

  @IsString()
  metadata?: Record<string, any>;
}
