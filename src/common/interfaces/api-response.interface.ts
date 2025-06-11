export interface ApiResponse<T = any> {
    status: number;
    message: string;
    data?: T;
    error?: string;
    timestamp: string;
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }
}