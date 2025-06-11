import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

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

    response.status(status).json({
      status,
      message,
      error: exception.name || 'HttpException'
    });
  }
}