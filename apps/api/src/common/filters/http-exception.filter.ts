import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    // Extract message safely from various exception shapes
    let message: unknown = 'Internal server error';
    let code = HttpStatus[status] || 'INTERNAL_ERROR';

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as Record<string, unknown>;
      message = resp.message ?? resp.error ?? message;
      code = (resp.code as string) ?? code;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log every error with request context in the message
    const url = (request as any).url || '/';
    const method = (request as any).method || 'UNKNOWN';
    const logMsg = `[${status}] ${method} ${url}: ${message}`;

    if (status >= 500) {
      this.logger.error(
        logMsg,
        exception instanceof Error ? exception.stack : undefined,
        'ExceptionFilter',
      );
    } else if (status >= 400) {
      this.logger.warn(logMsg, 'ExceptionFilter');
    }

    // In production, sanitize 500 errors to avoid leaking internals
    const isProduction = process.env.NODE_ENV === 'production';
    const sanitizedMessage =
      isProduction && status >= 500
        ? 'An unexpected error occurred'
        : message;

    response.status(status).json({
      status: 'error',
      error: {
        code,
        message: sanitizedMessage,
      },
    });
  }
}
