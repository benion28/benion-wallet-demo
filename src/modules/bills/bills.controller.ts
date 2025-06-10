import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillsService } from './bills.service';
import { CreateBillDto } from '@/modules/bills/dto/create-bill.dto';
import { BillResponseDto } from '@/modules/bills/dto/bill-response.dto';

@ApiTags('Bills')
@ApiBearerAuth()
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post('pay')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Process a bill payment' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully', type: BillResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid payment data' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 500, description: 'Payment processing failed' })
  async pay(
    @Request() req,
    @Body() createBillDto: CreateBillDto
  ): Promise<BillResponseDto> {
    return this.billsService.processBillPayment(req.user.userId, createBillDto);
  }

  @Get('status/:transactionId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check bill payment status' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved', type: BillResponseDto })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getPaymentStatus(
    @Param('transactionId') transactionId: string,
    @Request() req
  ): Promise<BillResponseDto> {
    return this.billsService.getPaymentStatus(transactionId, req.user.userId);
  }
}
