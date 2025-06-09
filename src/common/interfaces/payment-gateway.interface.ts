export interface IPaymentGateway {
    initializeTransaction(data: any): Promise<any>;
    verifyTransaction(reference: string): Promise<any>;
}