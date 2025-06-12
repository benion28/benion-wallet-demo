import { Wallet } from '../schemas/wallet.schema';

export interface WalletPaginationResponse {
  wallets: Wallet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WalletErrorResponse {
  status: number;
  message: string;
  error: string;
}

export type WalletResponse = WalletPaginationResponse | WalletErrorResponse;
