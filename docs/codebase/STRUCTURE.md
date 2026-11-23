# Structure

```
/                       AGENTS.md, FACTORY.md (factory), README.md — no root package.json
├── .github/            factory agents, skills, instructions, hooks (no workflows/)
├── backend/            NestJS API (own package.json / lockfile)
│   ├── src/
│   │   ├── main.ts, app.module.ts
│   │   ├── <feature>/              activities/, auth/, users/, roles/
│   │   │   ├── <feature>.{module,controller,service}.ts
│   │   │   ├── entities/           TypeORM entities (*.entity.ts)
│   │   │   ├── dto/ | models/      request/response DTOs
│   │   │   └── enums/, constants/, decorators/, guards/, strategies/ (as needed)
│   │   ├── models/auth/            auth DTOs/requests
│   │   ├── validators/business-rules/
│   │   ├── config/                 env validation
│   │   ├── database/               datasource.ts, seed.ts, migrations/
│   │   └── logging/                logger, interceptor, filter, request context
│   └── test/                       e2e (jest-e2e.json, *.e2e-spec.ts)
├── front/              Angular app (own package.json / lockfile)
│   ├── public/                     static files (favicon)
│   └── src/
│       ├── main.ts, index.html, styles.css, tailwind.css
│       ├── environments/           environment.ts / environment.production.ts
│       ├── assets/                 i18n/<scope>/fr.json, imgs/, styles/
│       └── app/
│           ├── app.{component,config,routes}.ts, theme.config.ts
│           ├── core/auth/          auth service, guards, interceptor, user/role models
│           ├── features/<feature>/ <feature>.routes.ts + <page>/<page>.component.{ts,html}
│           ├── repositories/<domain>/  <domain>.repository.ts + *.model.ts
│           ├── services/, directives/, utilities/
└── docs/               factory documentation (this folder)
```

Not versioned: `backend/.env`, `backend/logs/` (`backend/.gitignore`).

## History
- 2026-11-23 — onboard
