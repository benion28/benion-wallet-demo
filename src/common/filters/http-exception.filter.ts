import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../utils/api-response.util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus ? exception.getStatus() : 500;
    const message = exception.getResponse
      ? exception.getResponse().message || exception.message
      : 'Internal server error';

    const errorResponse = ApiResponse.error({
      status,
      message,
      error: exception.name || 'HttpException',
    });

    response.status(status).json(errorResponse);
  }
}