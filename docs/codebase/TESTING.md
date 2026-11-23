# Testing

## Current state
- **No unit tests** in either app. Only test file: `backend/test/app.e2e-spec.ts`, an unchanged Nest scaffold expecting `GET /` → `Hello World!`. That route doesn't exist (global prefix `/api`, no root controller) and the test boots the full `AppModule` (needs MySQL + valid env), so it is stale.
- No CI runs tests (no `.github/workflows/`).

## Backend — Jest 30 + ts-jest
- Unit: `*.spec.ts` co-located under `backend/src/` (`backend/package.json:75-89`, `rootDir: src`, `testRegex: .*\.spec\.ts$`).
- E2E: `backend/test/*.e2e-spec.ts`, config `backend/test/jest-e2e.json`, `supertest` + `@nestjs/testing`.
- Run once: `cd backend; npx jest --passWithNoTests` (plain `npm test` also exits 0 now, verified). Coverage: `npm run test:cov`.

## Front — Vitest 4 via `@angular/build:unit-test`
- `*.spec.ts` (or `*.test.ts`) co-located under `front/src/`, jsdom env, `vitest/globals` types (`front/angular.json:75`, `front/tsconfig.spec.json:7-13`).
- Run once: `cd front; npx ng test --watch=false`. With zero spec files the builder fails with "No tests found" (verified), so the command only passes once the first spec exists.

## Rules for new tests
- Unit tests co-located with the file under test, same base name + `.spec.ts` (implied by both runners' configs above).
- Mocking strategy / DB usage in tests: _(unknown — asked)_

## History
- 2026-11-23 — onboard
