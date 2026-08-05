import { Injectable, LoggerService } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as rfs from 'rotating-file-stream';
import { RequestContext } from './request-context';

type Level = 'fatal' | 'error' | 'warn' | 'log' | 'debug' | 'verbose';

const LEVEL_WEIGHT: Record<Level, number> = {
  fatal: 0,
  error: 1,
  warn: 2,
  log: 3,
  debug: 4,
  verbose: 5,
};

/**
 * Structured JSON logger (console + rotating files) used both as the
 * framework-wide Nest logger and as the backbone for HTTP/exception logging.
 * No external logging framework is used on purpose: `rotating-file-stream`
 * only handles file rotation/retention, the formatting stays fully in our
 * control here.
 */
@Injectable()
export class AppLogger implements LoggerService {
  private readonly minLevel: Level;
  private readonly logDir: string;
  private readonly appStream: rfs.RotatingFileStream;
  private readonly errorStream: rfs.RotatingFileStream;

  constructor() {
    this.minLevel =
      (process.env.LOG_LEVEL as Level) ||
      (process.env.NODE_ENV === 'production' ? 'log' : 'debug');
    this.logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
    fs.mkdirSync(this.logDir, { recursive: true });

    const maxSize = process.env.LOG_MAX_SIZE || '10M';
    const appRetentionDays = Number(process.env.LOG_APP_RETENTION_DAYS ?? 30);
    const errorRetentionDays = Number(
      process.env.LOG_ERROR_RETENTION_DAYS ?? 90,
    );

    this.appStream = this.createRotatingStream(
      'app',
      maxSize,
      appRetentionDays,
    );
    this.errorStream = this.createRotatingStream(
      'error',
      maxSize,
      errorRetentionDays,
    );
  }

  // --- NestJS LoggerService interface (used for framework bootstrap logs) ---

  log(message: unknown, context?: string): void {
    this.write(
      'log',
      this.stringify(message),
      context ? { context } : undefined,
    );
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.write('error', this.stringify(message), {
      ...(context ? { context } : {}),
      ...(trace ? { stack: trace } : {}),
    });
  }

  warn(message: unknown, context?: string): void {
    this.write(
      'warn',
      this.stringify(message),
      context ? { context } : undefined,
    );
  }

  debug(message: unknown, context?: string): void {
    this.write(
      'debug',
      this.stringify(message),
      context ? { context } : undefined,
    );
  }

  verbose(message: unknown, context?: string): void {
    this.write(
      'verbose',
      this.stringify(message),
      context ? { context } : undefined,
    );
  }

  fatal(message: unknown, context?: string): void {
    this.write(
      'fatal',
      this.stringify(message),
      context ? { context } : undefined,
    );
  }

  // --- Dedicated structured entry points used by interceptor/filter ---

  logHttpRequest(meta: Record<string, unknown>): void {
    this.write('log', 'Incoming request', { context: 'HTTP', ...meta });
  }

  logHttpResponse(meta: Record<string, unknown>): void {
    this.write('log', 'Request completed', { context: 'HTTP', ...meta });
  }

  logException(
    level: 'warn' | 'error',
    message: string,
    meta: Record<string, unknown>,
  ): void {
    this.write(level, message, { context: 'ExceptionsFilter', ...meta });
  }

  // --- Internals ---

  private stringify(message: unknown): string {
    return typeof message === 'string' ? message : JSON.stringify(message);
  }

  private shouldLog(level: Level): boolean {
    return LEVEL_WEIGHT[level] <= LEVEL_WEIGHT[this.minLevel];
  }

  private write(
    level: Level,
    message: string,
    extra?: Record<string, unknown>,
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const store = RequestContext.get();
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(store?.requestId ? { requestId: store.requestId } : {}),
      ...(store?.userId ? { userId: store.userId } : {}),
      ...extra,
    };

    const line = `${JSON.stringify(entry)}\n`;

    if (level === 'error' || level === 'fatal') {
      process.stderr.write(line);
      this.errorStream.write(line);
    } else {
      process.stdout.write(line);
    }
    this.appStream.write(line);
  }

  private createRotatingStream(
    prefix: string,
    maxSize: string,
    retentionDays: number,
  ): rfs.RotatingFileStream {
    const generator: rfs.Generator = (time, index) => {
      if (!time) {
        return `${prefix}.log`;
      }
      const date = time as Date;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const suffix = index && index > 1 ? `-${index}` : '';
      return `${prefix}-${year}-${month}-${day}${suffix}.log`;
    };

    const stream = rfs.createStream(generator, {
      size: maxSize,
      interval: '1d',
      path: this.logDir,
    });

    stream.on('rotated', () => this.cleanupOldFiles(prefix, retentionDays));
    stream.on('error', (err) => {
      // A file-system issue must never take the app down; fall back to stderr.
      process.stderr.write(
        `${JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `AppLogger rotating stream failure (${prefix}): ${String(err)}`,
          id: randomUUID(),
        })}\n`,
      );
    });

    return stream;
  }

  private cleanupOldFiles(prefix: string, retentionDays: number): void {
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    fs.readdir(this.logDir, (err, files) => {
      if (err) return;
      for (const file of files) {
        if (!file.startsWith(`${prefix}-`) || !file.endsWith('.log')) continue;
        const fullPath = path.join(this.logDir, file);
        fs.stat(fullPath, (statErr, stats) => {
          if (statErr) return;
          if (stats.mtimeMs < cutoff) {
            fs.unlink(fullPath, () => undefined);
          }
        });
      }
    });
  }
}
