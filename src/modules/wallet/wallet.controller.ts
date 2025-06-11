import { Controller, Post, Get, Body, Param, Request, UseGuards, Query, Delete } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { UserRole } from '../auth/enums/user-role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Wallet } from './schemas/wallet.schema';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all wallets',
    description: 'Retrieve a paginated list of all wallets (admin only)'
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'Page number (1-based)',
    required: false,
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'Number of items per page',
    required: false,
    example: 10
  })
  async findAll(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    if (req.user.roles.includes(UserRole.ADMIN)) {
      return await this.walletService.findAllAll(page, limit)
    }
    return await this.walletService.findByWalletUser(req.user.id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new wallet' })
  async create(
    @Request() req,
    @Body() createWalletDto: CreateWalletDto
  ) {
    return this.walletService.create(createWalletDto);
  }

  @Post('fund')
  @ApiOperation({ summary: 'Fund wallet with specified amount' })
  async fund(@Body() fundWalletDto: FundWalletDto, @Request() req) {
    return this.walletService.fundWallet(req.user.userId, fundWalletDto);
  }

  @Get('verify/:reference')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Verify wallet funding status' })
  async verify(@Param('reference') reference: string) {
    return this.walletService.verifyFunding(reference);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  async getBalance(@Request() req) {
    return this.walletService.getBalance(req.user.sub.toString());
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete wallet' })
  async delete(@Request() req, @Param('id') id: string) {
    return this.walletService.deleteUserWallet(id, req.user.sub);
  }
}
