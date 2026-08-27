import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLogger } from './app-logger.service';
import { sanitize } from './redact.util';
import { RequestContext } from './request-context';

interface AuthenticatedRequest extends Request {
  user?: { id?: string };
}

/**
 * Logs every incoming HTTP request (method, url, params, query, sanitized
 * body, ip, authenticated user) and its outcome (status code, duration).
 * Errors are left to propagate to `AllExceptionsFilter`, which owns the
 * detailed error logging.
 */
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<AuthenticatedRequest>();
    const res = httpContext.getResponse<Response>();
    const logBody = this.configService.get<boolean>('LOG_BODY') ?? false;

    if (req.user?.id) {
      RequestContext.setUserId(req.user.id);
    }

    const startedAt = Date.now();
    const url = req.originalUrl ?? req.url;

    this.logger.logHttpRequest({
      method: req.method,
      url,
      params: sanitize(req.params),
      query: sanitize(req.query),
      ...(logBody ? { body: sanitize(req.body) } : {}),
      ip: req.ip,
      userId: req.user?.id,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logger.logHttpResponse({
            method: req.method,
            url,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
            ...(logBody ? { responseBody: sanitize(data) } : {}),
          });
        },
        error: () => {
          // The exception itself is logged in detail by AllExceptionsFilter;
          // we only record the timing here to keep the request/response
          // correlation complete in the logs.
          this.logger.logHttpResponse({
            method: req.method,
            url,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
            failed: true,
          });
        },
      }),
    );
  }
}
