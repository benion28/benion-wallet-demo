export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  TRANSFER = 'transfer',
  BILL_PAYMENT = 'bill_payment',
  FUND_WALLET = 'fund_wallet',
  WITHDRAWAL = 'withdrawal',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}