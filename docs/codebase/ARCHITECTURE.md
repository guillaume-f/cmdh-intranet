# Architecture

## Overview
Two independent apps in one repo, no shared code:
- **`backend/`** — NestJS REST API, MySQL via TypeORM, all routes under `/api` (`backend/src/main.ts:36`).
- **`front/`** — Angular SPA calling the API at `environment.apiUrl` (`front/src/environments/environment.ts:3`).

```
Browser ── Angular SPA (front/) ──HTTP JSON + Bearer JWT──▶ NestJS API (backend/) ──TypeORM──▶ MySQL
                                  ◀── refresh_token cookie (httpOnly) ──
```

## Backend
- **Feature modules** wired in `AppModule`: `Roles`, `Auth`, `Users`, `Activities`, plus global `Logging` (`backend/src/app.module.ts:12-34`). Each module = controller → service → TypeORM entities.
- **Config**: `ConfigModule` global, env validated at boot by `validateEnvironment` (`backend/src/config/env.validation.ts:31`). Template: `backend/.env.example`.
- **Persistence**: `synchronize: false` (`backend/src/app.module.ts:27`); schema changes only through migrations in `backend/src/database/migrations/` (DataSource `backend/src/database/datasource.ts`). Seed script `backend/src/database/seed.ts`, gated by `ALLOW_SEED`.
- **Request pipeline**: global `ValidationPipe` whitelist + forbidNonWhitelisted + transform (`backend/src/main.ts:20-24`); CORS from `CORS_ORIGINS` with credentials (`backend/src/main.ts:29`); Swagger at `/api` when `SWAGGER_ENABLED` (`backend/src/main.ts:39-55`).
- **Auth**: JWT access token (Bearer) + refresh token in an httpOnly, `sameSite: strict` cookie `refresh_token` (`backend/src/auth/auth.controller.ts:25,97-100`). Endpoints: login, refresh, logout, forgot-password, reset-password (`backend/src/auth/auth.controller.ts:32-77`).
- **Authorization**: permission-based. `JwtAuthGuard` + `PermissionsGuard` with `@Permissions(...)`; `SelfOrPermissionGuard` for self-or-admin routes (`backend/src/users/users.controller.ts:35-51`). Permission keys in `backend/src/auth/constants/permissions.constants.ts`; roles stored in DB (`roles` table).
- **Logging**: `LoggingModule` registers `HttpLoggingInterceptor` and `AllExceptionsFilter` globally, request-id middleware, `AsyncLocalStorage` request context, rotating files (`backend/src/logging/logging.module.ts:19-25`, `backend/src/logging/request-context.ts:8`). Sensitive fields redacted by `sanitize` (`backend/src/logging/redact.util.ts:21`).

## Front
- **Standalone Angular**, providers in `front/src/app/app.config.ts`: router, `HttpClient` + `authInterceptor`, PrimeNG theme `CMDHPreset`, ngx-translate (`fr`).
- **Routing**: `/auth/*` lazy (public); everything else under `ShellComponent` behind `authGuard`, lazy features `activities`, `users`, `profile` (`front/src/app/app.routes.ts:6-47`).
- **Layers**: `features/` (pages/components) → `repositories/` (HTTP calls, DTO models) ; `core/auth/` (auth state, guards, interceptor, permissions).
- **Auth flow**: interceptor adds Bearer, on 401 performs a single shared refresh then replays (`front/src/app/core/auth/auth.interceptor.ts:30-63`). UI permission checks via `authService.can('<permission>')` (`front/src/app/features/shell/shell.component.ts:15`).

## History
- 2026-11-23 — onboard
