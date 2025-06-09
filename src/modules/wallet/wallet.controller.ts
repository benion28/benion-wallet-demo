import { Controller, Post, Get, Body, Param, Request, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('fund')
  async fund(@Body('amount') amount: number, @Request() req: any) {
    return this.walletService.fundWallet(req.user.userId, amount);
  }

  @Get('verify/:reference')
  async verify(@Param('reference') ref: string) {
    return this.walletService.verifyFunding(ref);
  }

  @Get('balance')
  async getBalance(@Request() req: any) {
    return this.walletService.getBalance(req.user.userId);
  }
}
