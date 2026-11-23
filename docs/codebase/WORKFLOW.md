# Factory Workflow

## Repository
- GitHub: `guillaume-f/cmdh-intranet` · default branch: `main` · branch pattern: `feature/<issue>-<slug>`
- Language (US, issue comments, PRs): fr

## Team
| Agent       | Enabled | Owns (globs) |
|-------------|---------|--------------|
| dev-front   | yes     | `front/**` except `front/**/*.spec.ts`, `front/**/*.test.ts`, `front/**/Dockerfile*` |
| dev-back    | yes     | `backend/**` except `backend/**/*.spec.ts`, `backend/test/**`, `backend/**/Dockerfile*` |
| dev-devops  | yes     | `.github/workflows/**`, `**/Dockerfile*`, `**/docker-compose*`, `**/.dockerignore` |
| tester      | yes     | `front/**/*.spec.ts`, `front/**/*.test.ts`, `backend/**/*.spec.ts`, `backend/test/**` |
| ux-designer | yes     | — |
| ui-designer | no      | — (tool: none, MCP server: none) |

Files matching no glob → the architect assigns them in the work breakdown.

## Commands
Two independent npm projects; run each command in both folders.

| Purpose | Command |
|---------|---------|
| install | `cd backend; npm ci` · `cd front; npm ci` |
| build   | `cd backend; npm run build` · `cd front; npm run build` |
| lint    | `cd backend; npx eslint "{src,apps,libs,test}/**/*.ts"` (check only; `npm run lint` applies `--fix`) · front: none |
| test    | `cd backend; npx jest --passWithNoTests` · `cd front; npx ng test --watch=false` (fails with "No tests found" until the first front spec exists) |

## Gates & limits (overrides of factory.agent.md — empty = defaults)
- max-files: 30

## History
- 2026-11-23 — onboard
