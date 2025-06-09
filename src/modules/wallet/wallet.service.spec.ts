import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { getModelToken } from '@nestjs/mongoose';
import { TransactionsService } from '../transactions/transactions.service';
import { BillsService } from '../bills/bills.service';

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getModelToken('Wallet'), useValue: {} },
        { provide: TransactionsService, useValue: {} },
        { provide: BillsService, useValue: {} },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
