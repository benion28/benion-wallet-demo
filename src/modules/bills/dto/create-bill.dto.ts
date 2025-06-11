import { IsNotEmpty, IsNumber, IsString, Min, IsOptional } from 'class-validator';

export class CreateBillDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  billReference: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsString()
  provider: string;

  @IsString()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  description: string;
}
