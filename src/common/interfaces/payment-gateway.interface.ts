export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  ABANDONED = 'abandoned'
}

export enum PaymentType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  BILL = 'bill'
}

export interface PaymentGateway {
    initializePayment(amount: number, email: string, reference: string, metadata?: any): Promise<PaymentInitResponse>;
    verifyPayment(reference: string): Promise<PaymentVerificationResponse>;
    getBanks(): Promise<Bank[]>;
    resolveAccount(accountNumber: string, bankCode: string): Promise<AccountDetails>;
    processBillPayment(data: BillPaymentData): Promise<BillPaymentResponse>;
}

export interface PaymentInitResponse {
    success: boolean;
    message: string;
    data: {
      authorizationUrl?: string;
      accessCode?: string;
      reference: string;
    };
}

export interface PaymentVerificationResponse {
    success: boolean;
    message: string;
    data: {
      amount: number;
      currency: string;
      transactionDate: Date;
      status: PaymentStatus;
      reference: string;
      metadata?: any;
    };
}

export interface BillPaymentData {
    amount: number;
    billReference: string;
    provider: string;
    metadata?: Record<string, any>;
}

export interface BillPaymentResponse {
    success: boolean;
    message: string;
    data: {
      transactionId: string;
      status: PaymentStatus;
      provider: string;
      billReference: string;
      amount: number;
    };
}

export interface Bank {
    name: string;
    code: string;
    active: boolean;
    country: string;
    currency: string;
    type: 'nuban' | 'mobile_money';
}

export interface AccountDetails {
    accountNumber: string;
    accountName: string;
    bankCode: string;
}

export interface PaymentMetadata {
    userId: string;
    walletId: string;
    description?: string;
    // Add any additional metadata fields you need
}