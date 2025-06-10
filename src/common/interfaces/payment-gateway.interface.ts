export interface PaymentGateway {
    initializePayment(amount: number, email: string, reference: string, metadata?: any): Promise<PaymentInitResponse>;
    verifyPayment(reference: string): Promise<PaymentVerificationResponse>;
    getBanks(): Promise<Bank[]>;
    resolveAccount(accountNumber: string, bankCode: string): Promise<AccountDetails>;
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
      status: 'success' | 'failed' | 'abandoned' | 'pending';
      reference: string;
      metadata?: any;
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