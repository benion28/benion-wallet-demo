import { IApiResponse } from '../interfaces/api-response.interface';

export class ApiResponse {
  static success<T = any>({
    status = 200,
    success = true,
    message = 'Operation successful',
    data = null,
  }: Partial<IApiResponse<T>> & { data?: T }): IApiResponse<T> {
    return {
      success,
      status,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error<T = any>({
    status = 500,
    success = false,
    message = 'An error occurred',
    error = 'Internal Server Error',
    data = null,
  }: Partial<IApiResponse<T>> & { error?: string }): IApiResponse<T> {
    return {
      success,
      status,
      message,
      error,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static fromError(error: any): IApiResponse {
    const status = error.status || 500;
    const message = error.message || 'An unexpected error occurred';
    
    return {
      success: false,
      status,
      message,
      error: error.name || 'InternalServerError',
      timestamp: new Date().toISOString(),
    };
  }
}