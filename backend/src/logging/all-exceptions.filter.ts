import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AppLogger } from './app-logger.service';
import { sanitize } from './redact.util';

interface AuthenticatedRequest extends Request {
  user?: { id?: string };
}

/**
 * Catches every exception (HttpException or unexpected error), logs it with
 * full context (stack trace, request method/url/params/query/body, user),
 * and returns a client-safe response. 4xx keep their normal Nest payload,
 * 5xx hide internal details from the client in production while still
 * logging everything server-side.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<AuthenticatedRequest>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const isServerError = status >= 500;
    const url = request.originalUrl ?? request.url;

    this.logger.logException(
      isServerError ? 'error' : 'warn',
      this.getMessage(exception),
      {
        method: request.method,
        url,
        statusCode: status,
        params: sanitize(request.params),
        query: sanitize(request.query),
        ...(this.configService.get<boolean>('LOG_BODY')
          ? { body: sanitize(request.body) }
          : {}),
        userId: request.user?.id,
        stack: exception instanceof Error ? exception.stack : undefined,
      },
    );

    const body = this.buildResponseBody(
      exception,
      status,
      isHttpException,
      isServerError,
    );
    body.path = url;
    body.timestamp = new Date().toISOString();

    response.status(status).json(body);
  }

  private getMessage(exception: unknown): string {
    if (exception instanceof Error) return exception.message;
    return 'Unknown error';
  }

  private buildResponseBody(
    exception: unknown,
    status: number,
    isHttpException: boolean,
    isServerError: boolean,
  ): Record<string, unknown> {
    if (isHttpException && !isServerError) {
      const exceptionResponse = (exception as HttpException).getResponse();
      return typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? { ...(exceptionResponse as Record<string, unknown>) }
        : { statusCode: status, message: exceptionResponse };
    }

    const message =
      isServerError &&
      this.configService.get<string>('NODE_ENV') === 'production'
        ? 'Internal server error'
        : this.getMessage(exception);

    return { statusCode: status, message };
  }
}
