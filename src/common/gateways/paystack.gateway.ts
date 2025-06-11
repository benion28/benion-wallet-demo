import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { 
  PaymentGateway, 
  PaymentInitResponse, 
  PaymentVerificationResponse, 
  Bank, 
  AccountDetails,
  PaymentStatus 
} from '../interfaces/payment-gateway.interface';

@Injectable()
export class PaystackGateway implements PaymentGateway {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initializePayment(amount: number, email: string, reference: string, metadata?: any): Promise<PaymentInitResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/transaction/initialize`,
          {
            email,
            amount: amount * 100, // Convert to kobo
            reference,
            metadata,
          },
          { headers: this.getHeaders() },
        ),
      );

      return {
        success: true,
        message: 'Payment initialized successfully',
        data: {
          authorizationUrl: response.data.data.authorization_url,
          accessCode: response.data.data.access_code,
          reference: response.data.data.reference,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to initialize payment',
        data: { reference },
      };
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/transaction/verify/${reference}`, {
          headers: this.getHeaders(),
        }),
      );

      return {
        success: response.data.status,
        message: response.data.message,
        data: {
          amount: response.data.data.amount / 100, // Convert back to naira
          currency: response.data.data.currency,
          transactionDate: new Date(response.data.data.transaction_date),
          status: response.data.data.status,
          reference: response.data.data.reference,
          metadata: response.data.data.metadata,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify payment',
        data: {
          amount: 0,
          currency: 'NGN',
          transactionDate: new Date(),
          status: PaymentStatus.FAILED,
          reference,
        },
      };
    }
  }

  async processBillPayment(data: any): Promise<any> {
    try {
      // This is a mock implementation since Paystack doesn't have a direct bill payment endpoint
      // In a real implementation, you would call the appropriate Paystack API endpoint for bill payments
      console.log('Processing bill payment with data:', data);
      
      // Simulate a successful payment
      return {
        success: true,
        message: 'Bill payment processed successfully',
        data: {
          transactionId: `BILL-${Date.now()}`,
          status: PaymentStatus.SUCCESS,
          provider: data.provider,
          billReference: data.billReference,
          amount: data.amount
        }
      };
    } catch (error) {
      console.error('Error processing bill payment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to process bill payment',
        data: null
      };
    }
  }

  async getBanks(): Promise<Bank[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/bank`, {
          params: { country: 'nigeria' },
          headers: this.getHeaders(),
        }),
      );

      return response.data.data.map((bank: any) => ({
        name: bank.name,
        code: bank.code,
        active: bank.active,
        country: bank.country,
        currency: bank.currency,
        type: bank.type,
      }));
    } catch (error) {
      console.error('Error fetching banks:', error);
      return [];
    }
  }

  async resolveAccount(accountNumber: string, bankCode: string): Promise<AccountDetails> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
          { headers: this.getHeaders() },
        ),
      );

      return {
        accountNumber: response.data.data.account_number,
        accountName: response.data.data.account_name,
        bankCode,
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to resolve account');
    }
  }
}