# Testing

## Current state
- Backend unit tests: 4 co-located spec files under `backend/src/` (`auth/auth.service.spec.ts`, `auth/strategies/jwt.strategy.spec.ts`, `users/users.service.spec.ts`, `users/users.controller.spec.ts`) — 24 tests, pass (verified).
- Front unit tests: 1 spec file, `front/src/app/features/users/user-edit/user-edit.component.spec.ts` — 7 tests, pass (verified).
- E2E: `backend/test/app.e2e-spec.ts`, an unchanged Nest scaffold expecting `GET /` → `Hello World!`. That route doesn't exist (global prefix `/api`, no root controller) and the test boots the full `AppModule` (needs MySQL + valid env), so it is stale.
- No CI runs tests (no `.github/workflows/`).

## Backend — Jest 30 + ts-jest
- Unit: `*.spec.ts` co-located under `backend/src/` (`backend/package.json:75-89`, `rootDir: src`, `testRegex: .*\.spec\.ts$`).
- E2E: `backend/test/*.e2e-spec.ts`, config `backend/test/jest-e2e.json`, `supertest` + `@nestjs/testing`.
- Run once: `cd backend; npx jest --passWithNoTests` (plain `npm test` also exits 0 now, verified). Coverage: `npm run test:cov`.

## Front — Vitest 4 via `@angular/build:unit-test`
- `*.spec.ts` (or `*.test.ts`) co-located under `front/src/`, jsdom env, `vitest/globals` types (`front/angular.json:75`, `front/tsconfig.spec.json:7-13`).
- Run once: `cd front; npx ng test --watch=false` (passes, verified). The builder fails with "No tests found" if there are zero spec files.

## Rules for new tests
- Unit tests co-located with the file under test, same base name + `.spec.ts` (implied by both runners' configs above).
- Mocking strategy / DB usage in tests: _(unknown — asked)_

## History
- 2026-11-23 — onboard
- 2026-11-24 — US-001: first backend and front unit tests; current state updated
