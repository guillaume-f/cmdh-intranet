import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { AppLogger } from './app-logger.service';
import { HttpLoggingInterceptor } from './http-logging.interceptor';
import { RequestIdMiddleware } from './request-id.middleware';

/**
 * Wires the whole logging setup: structured JSON logger (console + rotating
 * files), request-id correlation middleware, HTTP request/response logging
 * interceptor and the global exception filter. Global so `AppLogger` can be
 * injected anywhere (e.g. `app.useLogger()` in main.ts) without re-importing
 * this module.
 */
@Global()
@Module({
  providers: [
    AppLogger,
    { provide: APP_INTERCEPTOR, useClass: HttpLoggingInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
  exports: [AppLogger],
})
export class LoggingModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
