export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  TRANSFER = 'transfer',
  BILL_PAYMENT = 'bill_payment',
  FUND_WALLET = 'fund_wallet',
  WITHDRAWAL = 'withdrawal',
  MANUAL = 'manual'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SUCCESS = 'success',
}