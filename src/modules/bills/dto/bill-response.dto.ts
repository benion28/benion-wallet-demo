// Using string literals for status since transactions service uses them

export class BillResponseDto {
  transactionId: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  billReference: string;
  provider: string;
  message?: string;
  metadata?: Record<string, any>;
}
