---
name: onboard
description: "Onboards the Dark Factory on a repository: creates the docs/ skeleton, scans the codebase, fills docs/codebase/*.md, and writes docs/codebase/WORKFLOW.md (GitHub repo, enabled agents, file ownership, commands, design tool, limits). Run by the architect; re-run when the repo drifts."
---

# onboard

Makes the factory runnable on this repo. Never invent: what you can't infer is asked (`QUESTIONS`, one batch per round, max 4 items).
**Onboarding is not DONE until `docs/codebase/WORKFLOW.md` exists and is complete** (§6).

## 1. Skeleton (create what is missing — never overwrite an existing file)
```
docs/
├── codebase/ ARCHITECTURE.md · CONVENTIONS.md · STACK.md · STRUCTURE.md · TESTING.md   (filled in §3)
│             WORKFLOW.md                                                              (written in §5)
│             SECURITY-DEBT.md   (empty table: ID · Risk · Location · Accepted in · Date)
├── adr/0000-template.md         (copy of .github/skills/onboard/assets/adr-template.md)
├── us/INDEX.md                  (run the refresh-index skill → empty index)
└── notes/                       (empty, optional scratch space)
```
Existing files are kept and completed, never replaced.

## 2. Scan
1. Root files: manifests (`package.json`, `*.csproj`/`*.sln`, `pom.xml`, `build.gradle*`, `composer.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`), `Dockerfile`, `docker-compose*`, `.github/workflows/`, lint/format configs, `.editorconfig`, `.vscode/mcp.json`.
2. Folder tree (depth 3): roles of `src/`, `app/`, `api/`, `web/`, `tests/`, `infra/`; monorepo signals.
3. Commands: install, build, lint, test — from scripts/manifests. Prefer single-run (non-watch) variants.
4. Git: `git remote get-url origin`; default branch via `gh repo view --json defaultBranchRef`.

## 3. Fill docs/codebase/
`ARCHITECTURE`, `CONVENTIONS`, `STACK`, `STRUCTURE`, `TESTING`: what you inferred (with `file:line` evidence), `_(unknown — asked)_` elsewhere. Terse, evergreen, no feature details. Append `- <today> — onboard` to each `## History`.

## 4. Ask (one batch, only what the scan didn't answer)
- Which dev agents to enable (`dev-front`, `dev-back`, `dev-devops`) and their ownership globs — propose from the detected areas; never enable an agent with no code to own.
- Design tool for `ui-designer`: Figma · Penpot · none (→ disabled). Figma/Penpot → the user adds the MCP server to `.vscode/mcp.json`; you record the server name.
- Language for US, issue comments and PRs.
- Extra human gates or stricter limits, if any.

## 5. Write docs/codebase/WORKFLOW.md (mandatory)

```markdown
# Factory Workflow

## Repository
- GitHub: `<owner>/<repo>` · default branch: `<branch>` · branch pattern: `feature/<issue>-<slug>`
- Language (US, issue comments, PRs): <fr | en | …>

## Team
| Agent       | Enabled | Owns (globs) |
|-------------|---------|--------------|
| dev-front   | yes/no  | <globs> |
| dev-back    | yes/no  | <globs> |
| dev-devops  | yes/no  | <globs> |
| tester      | yes     | <test file globs> |
| ux-designer | yes/no  | — |
| ui-designer | yes/no  | — (tool: figma/penpot/none, MCP server: `<name>`) |

Files matching no glob → the architect assigns them in the work breakdown.

## Commands
| Purpose | Command |
|---------|---------|
| install | <cmd> |
| build   | <cmd> |
| lint    | <cmd or none> |
| test    | <cmd, single run> |

## Gates & limits (overrides of factory.agent.md — empty = defaults)
- max-files: 30

## History
- <today> — onboard
```
Ownership globs must not overlap.

## 6. Done check
Before returning `DONE`, verify:
- every file of §1 exists;
- `WORKFLOW.md` has no `<…>` placeholder left, at least one dev agent enabled, `tester` enabled, a `build` and a `test` command;
- `docs/codebase/*.md` contain no `_(pending` marker (`_(unknown — asked)_` is allowed only if the user chose to leave it open).
Anything failing → `QUESTIONS` (missing info) — never `DONE`.

## 7. Report
```
Onboarding — <repo>
Created: <files>   Completed: <files>   Inferred: <short list>   Asked: <N>   Open unknowns: <list | none>
WORKFLOW.md: complete | missing <fields>
VERDICT: DONE | QUESTIONS
```

## Constraints
- No fact without evidence. No library in `STACK.md` the repo doesn't depend on.
- Writes only under `docs/`. Don't touch code, agent, skill or config files (`.vscode/mcp.json` is the user's job).
