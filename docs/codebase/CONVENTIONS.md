# Conventions

## Common
- TypeScript, single quotes, 2-space indent (`front/.editorconfig`, `backend/.prettierrc`, `front/.prettierrc`).
- Prettier: backend `trailingComma: all`, default width 80; front `printWidth: 100`, Angular parser for HTML.
- kebab-case file names with a role suffix: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.entity.ts`, `*.dto.ts`, `*.request.ts`, `*.component.ts`, `*.repository.ts`, `*.model.ts`, `*.routes.ts`.
- Commit messages: short, mostly French, no prefix convention (`git log`).

## Backend
- ESLint `recommendedTypeChecked` + Prettier as error (`backend/eslint.config.mjs`).
- One Nest module per feature; controllers stay thin and delegate to the service (`backend/src/users/users.controller.ts`).
- Every controller: `@ApiTags`, `@ApiBearerAuth('access-token')`, `@UseGuards(JwtAuthGuard, PermissionsGuard)`; every route declares its `@Permissions(PERMISSIONS.X)` or `@SelfOrPermission(...)` and Swagger response type (`backend/src/users/users.controller.ts:32-80`).
- DTOs validated with `class-validator`; responses mapped to `*ResponseDto` classes, entities never returned raw.
- Entities: UUID primary keys `@PrimaryGeneratedColumn('uuid')`, snake_case plural table names (`backend/src/activities/entities/attendance-validation.entity.ts:12-14`).
- Schema changes: new migration `<timestamp>-PascalName.ts`, class `PascalName<timestamp>` (`backend/src/database/migrations/1788000000000-AllowNullUserPassword.ts:3`). Never `synchronize`.
- New env var → add to `AppEnvironment` + `validateEnvironment` and `backend/.env.example`.

## Front
- Standalone components, `ChangeDetectionStrategy.OnPush`, `inject()` instead of constructor DI, external `templateUrl` (`front/src/app/features/users/user-list/user-list.component.ts:10-17`).
- State with signals (`signal`, `computed`, `toSignal`); class members `protected readonly` for template use.
- HTTP only in `repositories/<domain>/<domain>.repository.ts`, `providedIn: 'root'`, base URL `${environment.apiUrl}/<resource>` (`front/src/app/repositories/users/users.repository.ts:9-14`).
- Features lazy-loaded via `<feature>.routes.ts` (`front/src/app/app.routes.ts`).
- UI with PrimeNG components + Tailwind utilities; theme in `front/src/app/theme.config.ts`.
- User-facing text via ngx-translate keys, French only (`front/src/assets/i18n/fr.json`, `front/src/assets/i18n/auth/fr.json`).
- Permission-gated UI via `authService.can('<resource>:<action>')`, keys mirror backend `PERMISSIONS`.

## History
- 2026-11-23 — onboard
