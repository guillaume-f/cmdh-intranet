# Stack

## Runtime & language
- TypeScript everywhere: backend `^5.7.3` (`backend/package.json:72`), front `~5.9.2` (`front/package.json:39`).
- Node.js runtime for the API; Node version not pinned (no `.nvmrc` / `engines`).
- npm, one lockfile per app (`backend/package-lock.json`, `front/package-lock.json`); front pins `npm@10.8.2` (`front/package.json:12`). No root workspace.

## Backend (`backend/`)
| Concern | Library | Evidence |
|---------|---------|----------|
| Framework | NestJS 11 (`@nestjs/core`, `platform-express`) | `backend/package.json:27-32` |
| Config | `@nestjs/config` + custom validator | `backend/src/config/env.validation.ts` |
| ORM / DB | TypeORM `^1.0.0` + `mysql2` (MySQL) | `backend/src/app.module.ts:19`, `backend/package.json:39,45` |
| Auth | `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`, `cookie-parser` | `backend/package.json:30-31,35,38,41` |
| Validation | `class-validator`, `class-transformer` | `backend/src/main.ts:20-24` |
| API docs | `@nestjs/swagger` | `backend/src/main.ts:39-55` |
| Logging | custom `AppLogger` + `rotating-file-stream` | `backend/src/logging/app-logger.service.ts:30` |
| Tests | Jest 30, `ts-jest`, `@nestjs/testing`, `supertest` | `backend/package.json:52,64,67-68` |
| Lint/format | ESLint 9 + `typescript-eslint` + Prettier 3 | `backend/eslint.config.mjs` |

## Front (`front/`)
| Concern | Library | Evidence |
|---------|---------|----------|
| Framework | Angular 21 (standalone, `@angular/build` application builder) | `front/package.json:14-19`, `front/angular.json:17` |
| UI kit | PrimeNG 21 + `@primeuix/themes` + PrimeIcons | `front/package.json:22,24-25,27`, `front/src/app/app.config.ts:16-20` |
| Styling | Tailwind CSS 4 (PostCSS) + `tailwindcss-primeui` | `front/.postcssrc.json`, `front/src/styles.css` |
| i18n | `@ngx-translate/core` + `http-loader` | `front/src/app/app.config.ts:21-28` |
| Dates | `dayjs` | `front/package.json:23` |
| Tests | Vitest 4 + jsdom via `@angular/build:unit-test` | `front/angular.json:75`, `front/tsconfig.spec.json:7-9` |
| Format | Prettier 3 (no ESLint) | `front/.prettierrc` |

## Infrastructure
- No Dockerfile, docker-compose, CI workflow or IaC in the repo.
- Database: MySQL (default `localhost:3306/cmdh_intranet`, `backend/src/config/env.validation.ts:54-63`).

## History
- 2026-11-23 — onboard
