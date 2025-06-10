export interface IApiResponse<T = any> {
    success: boolean;
    status: number;
    message: string;
    data?: T;
    error?: string;
    timestamp: string;
}