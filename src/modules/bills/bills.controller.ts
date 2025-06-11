import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { BillResponseDto } from './dto/bill-response.dto';

@ApiTags('Bills')
@ApiBearerAuth()
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post('pay')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Process a bill payment',
    description: 'Initiate and process a bill payment using the wallet'
  })
  @ApiBody({
    type: CreateBillDto,
    schema: {
      properties: {
        billId: {
          type: 'string',
          description: 'ID of the bill to be paid',
          example: '64f123456789abcdef123456'
        },
        amount: {
          type: 'number',
          description: 'Amount to be paid',
          example: 100.00
        },
        reference: {
          type: 'string',
          description: 'Transaction reference',
          example: 'BILL-123456'
        },
        description: {
          type: 'string',
          description: 'Payment description',
          example: 'Electricity bill payment'
        }
      }
    }
  })
  async pay(
    @Request() req,
    @Body() createBillDto: CreateBillDto
  ): Promise<BillResponseDto> {
    return this.billsService.processBillPayment(req.user.userId, createBillDto);
  }

  @Get('status/:transactionId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Check bill payment status',
    description: 'Retrieve the status of a bill payment transaction'
  })
  @ApiParam({
    name: 'transactionId',
    type: 'string',
    description: 'ID of the transaction to check',
    required: true,
    example: '64f123456789abcdef123456'
  })
  async getPaymentStatus(
    @Param('transactionId') transactionId: string,
    @Request() req
  ): Promise<BillResponseDto> {
    return this.billsService.getPaymentStatus(transactionId, req.user.userId);
  }
}
