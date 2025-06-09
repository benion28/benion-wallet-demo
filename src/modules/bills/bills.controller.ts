import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { BillsService } from './bills.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Bills')
@ApiBearerAuth()
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post('initiate')
  async initiate(@Body() body: any) {
    return this.billsService.initializePayment(body);
  }

  @Get('verify/:reference')
  async verify(@Param('reference') reference: string) {
    return this.billsService.verifyPayment(reference);
  }
}
