# Dark Factory — Onboarding & Usage Guide (GitHub Copilot edition)

> For developers and tech leads who want to run the Dark Factory on their own repository with **GitHub Copilot in VS Code**.
> Rules the agents obey: [AGENTS.md](AGENTS.md). Orchestrator protocol: [.github/agents/factory.agent.md](.github/agents/factory.agent.md).

The Dark Factory is a team of Copilot custom agents that turns a **GitHub issue into a pull request**. It runs on its own along the documented path, works in parallel where the plan allows, and **stops to ask you whenever a choice isn't written down**. It never merges.

This is the GitHub Copilot port of the Claude Code edition. Same agents, same rules, same `docs/` layout: a repo onboarded with one edition works with the other.

---

## 1. Prerequisites

| Tool | Why | Check |
|------|-----|-------|
| VS Code + GitHub Copilot (agent mode) | Runs the agents | Copilot Chat → agent picker |
| Copilot features: **custom agents**, **subagents**, **agent skills**, **instruction files**, **hooks** | The factory uses all five | see below |
| GitHub CLI, authenticated | Reads issues, pushes branches, opens PRs | `gh auth status` |
| `git`, plus `bash` (macOS/Linux) or PowerShell (Windows) | Git operations; the guardrails hook | `git --version` |
| The repo's own toolchain (node, dotnet, java…) | Build and test checks | your usual build command |

Some of these features are recent or in preview and may sit behind a setting (or an organization policy for Copilot Business/Enterprise). Check in VS Code settings (search `chat.`) that AGENTS.md, agent skills, subagents and hooks are enabled — e.g. `chat.useAgentsMdFile`, `chat.useAgentSkills`. Setting names move between VS Code releases: trust the Settings search over this list.

The repo needs a GitHub remote (`origin`) and a clean working tree to start an issue.

### Models

Copilot runs each custom agent on the model in the picker unless its file pins one. Each `.agent.md` carries a comment with the recommended tier; to pin it, add `model: "<exact name from the model picker>"` to its frontmatter.

| Tier | Agents | Example |
|------|--------|---------|
| Standard (recommended default) | factory, BA, designers, devs, tester, reviewer | a Claude Sonnet-class model |
| Strong | architect; factory on complex runs (full track, 3+ build agents, first runs on a new repo) | a Claude Opus-class model |
| Light | maintainer, finalizer | a Claude Haiku-class model |

Light models are not supported for the factory itself: too weak to hold the gates, limits and the no-AI-decision rule. At the start of every session the factory checks its own model and warns you.

---

## 2. Install the factory in a repository

Copy these into the **root** of the target repo:

```
your-repo/
├── .github/
│   ├── agents/         ← factory orchestrator + 11 specialists (*.agent.md)
│   ├── instructions/   ← documentation discipline + US schema (applyTo docs/**)
│   ├── skills/         ← process-issue, onboard, new-us, refresh-index
│   └── hooks/          ← guardrails (bash + PowerShell)
├── AGENTS.md           ← constitution (read by Copilot automatically)
└── FACTORY.md          ← this guide (optional)
```

Don't copy `docs/`: onboarding creates it for your repo.
If the repo already has `.github/` (workflows, templates…), merge folder by folder: nothing here overwrites CI files. If it already has an `AGENTS.md` or `.github/copilot-instructions.md`, merge by hand and keep your content.

Commit these files on a branch of your own; the factory starts working only on issues.

---

## 3. Onboard the repository (once per repo)

1. Open the repo in VS Code, open Copilot Chat, and select **factory** in the agent picker. (Copilot has no "default agent" setting: pick `factory` each new chat.)
2. Say: **"Onboard this repo."** (The factory also does it automatically the first time you start an issue, because `docs/codebase/WORKFLOW.md` is missing.)
3. Sheldon (architect) runs the `onboard` skill:
   - **creates the `docs/` skeleton**: `docs/codebase/` (ARCHITECTURE, CONVENTIONS, STACK, STRUCTURE, TESTING, **WORKFLOW**, SECURITY-DEBT), `docs/adr/0000-template.md`, `docs/us/INDEX.md`, `docs/notes/`. Existing files are completed, never overwritten.
   - **scans** the manifests, folder tree, CI files, scripts and git remote;
   - **fills** `docs/codebase/*.md` with what it can prove (`file:line`);
   - **asks you** what it couldn't infer.
4. Answer the questions. Typical ones:

| Question | What it decides |
|----------|-----------------|
| Which dev agents to enable, and which files each owns | Who runs in the build phase. Only enable agents that have code to own. |
| Design tool: Figma, Penpot or none | Enables `ui-designer` (Denise) or not |
| Language for user stories, issue comments and PRs | e.g. `fr` or `en` |
| Extra gates or stricter limits | Overrides of the defaults (§6) |

5. The architect doesn't report onboarding as done until `docs/codebase/WORKFLOW.md` exists and has no placeholder, at least one dev agent and the tester are enabled, and the `build` and `test` commands are known.
6. **Review and commit `docs/`.** `WORKFLOW.md` is your factory configuration for this repo.

### Optional: UI design with Figma or Penpot

`ui-designer` works in your design tool through an MCP server declared in `.vscode/mcp.json`. For example, for Figma's remote server (check Figma's documentation for the current URL):

```json
{
  "servers": {
    "figma": { "type": "http", "url": "https://mcp.figma.com/mcp" }
  }
}
```

For Penpot, declare its MCP server following Penpot's documentation. Start and authenticate the server from VS Code, set `ui-designer` to `yes` in `WORKFLOW.md` and record the server name. If the MCP server is unavailable, Denise stops with `BLOCKED`; she never fakes a design.

---

## 4. Process an issue

With the `factory` agent selected:

```
/process-issue 42
```

(If your VS Code doesn't expose skills as slash commands, say "Process issue 42": the factory follows `.github/skills/process-issue/SKILL.md`.)

| Step | Who | You |
|------|-----|-----|
| Preflight: clean tree, `gh` auth, branch `feature/42-<slug>`, label `ai-generated` | factory | — |
| Spec: interview, Gherkin acceptance criteria, proposed track & team | Bernard | **answer the questions** |
| Design (full track): UX flows and a11y, then UI in Figma/Penpot if enabled | Stuart, Denise | answer any decision |
| Tech design + **work breakdown** (who owns which file, in which order) | Sheldon | answer any decision (ADR, dependency) |
| **Plan gate** — summary, scenarios, track, team, breakdown | factory | **approve, or ask for changes** |
| Plan commit, push, comment on the issue | factory | — |
| Build: devs + tester on disjoint files | Wil, Howard, Kripke, Raj | answer any decision |
| Integration check: build, lint, test, run by the orchestrator | factory | — |
| Review: OWASP, secrets, perf, pre-PR (+ dependency audit if needed) | Bernadette (+ Leonard) | accept or reject flagged risks |
| Docs, index, README | Penny | — |
| Pre-push check, commit, push, **PR** with a *Decisions* section | factory | **review and merge the PR** |

After the plan gate the factory runs on its own. It comes back to you only when an agent needs information (`QUESTIONS`), needs a choice (`DECISION`), or hits a limit.

**Resume** an interrupted run with the same command: it finds the branch and the user story and continues from its status.

**No issue yet?** Describe the idea to the factory. It restates it and asks whether to open the GitHub issue for you.

### How questions reach you

- The **context** (what was found, the options and their consequences, a recommendation if any) is written in the chat.
- The **short question** comes as a question prompt with the options (`askQuestions` tool), the recommended one first. If your VS Code doesn't offer that tool, the factory lists the questions in chat and waits for your reply.
- Every choice you make is logged in the user story's **§9 Decisions** section and copied into the PR.

---

## 5. Tracks and team

| Track | Stages | Use when |
|-------|--------|----------|
| `light` | spec → build → review → docs | Follows an existing pattern; no new component, contract, schema, config key or dependency |
| `backend` | spec → architecture → build → review → docs | No UI impact |
| `full` | spec → UX/UI design → architecture → build → review → docs | User-visible UI/UX change |

| Agent | Persona | Tier | Role |
|-------|---------|------|------|
| `factory` | The team | standard | Orchestrator: routing, questions, git/gh, last word |
| `business-analyst` | Bernard | standard | Interview, Gherkin, track & team |
| `ux-designer` | Stuart | standard | Flows, wireframes, accessibility |
| `ui-designer` | Denise | standard | Visual design in Figma/Penpot (MCP) |
| `architect` | Sheldon | strong | Onboarding, tech design, ADRs, work breakdown |
| `dev-front` | Wil | standard | Front-end |
| `dev-back` | Howard | standard | Back-end |
| `dev-devops` | Kripke | standard | CI/CD, infra, build config (never touches real environments) |
| `tester` | Raj | standard | Tests from the Gherkin, failure triage |
| `security-perf-reviewer` | Bernadette | standard | Read-only review |
| `maintainer` | Leonard | light | Dependency audit, on demand |
| `finalizer` | Penny | light | Paper trail, index, README |

Specialists also appear in the agent picker: you can talk to one directly (e.g. Bernard to draft a spec), but the pipeline, git and the US bookkeeping belong to `factory`.

---

## 6. Safety net

| Limit | Default | When hit |
|-------|---------|----------|
| Rework loops per user story (review + build + test failures) | 3 | stops and asks you |
| Same failure twice in a row | stop | asks you |
| Consultations per agent run | 2 | treated as blocked |
| Going back to an earlier stage | 1 per user story | asks you |
| Subagents in parallel | 4 | queues the rest |
| Files changed in one PR | 30 (`max-files`) | asks you (split?) |

Override them in `WORKFLOW.md` → *Gates & limits*. The factory never raises a limit on its own.

The guardrails hook (`.github/hooks/guardrails.json` → `scripts/guardrails.sh`, or `guardrails.ps1` on Windows) blocks these terminal commands whatever an agent tries: force-push, `--no-verify`, `git reset --hard`, `git clean -f`, push to `main`/`master`, `gh pr merge`, `rm -rf /`, `curl | sh`, `iwr | iex`. Only terminal tools are checked.

Agent hooks are a recent Copilot feature: check they are enabled. Without them, the rules in `AGENTS.md` still forbid these commands, but nothing enforces them — keep VS Code's terminal command approval on.

The factory never merges, never deploys, and never adds a dependency without an ADR that you approved.

---

## 7. Differences with the Claude Code edition

| Topic | Claude Code | GitHub Copilot |
|-------|-------------|----------------|
| Start | `.claude/settings.json` makes `factory` the default agent | select `factory` in the agent picker |
| Specialists | `.claude/agents/*.md` | `.github/agents/*.agent.md` (`target: vscode`) |
| Rules | `.claude/rules/` (`paths:`) | `.github/instructions/*.instructions.md` (`applyTo:`) |
| Skills | `.claude/skills/` | `.github/skills/` (same `SKILL.md` format) |
| Asking the user | `AskUserQuestion` popups | `askQuestions` tool, or questions in chat |
| Re-running a specialist after an answer | resumed with its context (`SendMessage`) | **new run** with its previous report + the answers; the US file carries the state |
| Models | pinned per agent (`model: sonnet/opus/haiku`) | picker by default; pin with `model:` (tier comment in each file) |
| MCP config | `.mcp.json` | `.vscode/mcp.json` |
| Guardrails | `PreToolUse` hook, matcher `Bash` | `PreToolUse` hook, script filters terminal tools; bash + PowerShell |

---

## 8. Where things live

| What | Where |
|------|-------|
| Factory config for this repo | `docs/codebase/WORKFLOW.md` |
| Project knowledge (stack, conventions, structure, tests) | `docs/codebase/*.md` |
| One feature: spec, design, tech design, notes, tests, review, decisions | `docs/us/US-XXX-slug.md` |
| Overview of all user stories | `docs/us/INDEX.md` |
| Hard-to-reverse decisions | `docs/adr/NNNN-slug.md` |
| Accepted risks | `docs/codebase/SECURITY-DEBT.md` |

---

## 9. Troubleshooting

| Symptom | Cause → fix |
|---------|-------------|
| `factory` missing from the agent picker | Custom agents disabled, or files not under `.github/agents/` → check settings, reload the window |
| Factory does the specialists' work itself | Subagents disabled or the `agent` tool unavailable → enable subagents in settings |
| "Onboard first" at `/process-issue` | `WORKFLOW.md` missing or incomplete → say "Onboard this repo" |
| Stops at preflight | Dirty tree or `gh` not logged in → commit/stash your work yourself, `gh auth login` |
| `BLOCKED — factory: design tool MCP unavailable` | MCP server not declared, started or authenticated → `.vscode/mcp.json`, or disable `ui-designer` |
| `Guardrail tripped` | An agent tried a forbidden command; it is reported to you, nothing ran |
| Rework limit reached | The factory shows the failing output; decide: fix it yourself, revise the plan, or raise the limit in `WORKFLOW.md` |
| Wrong agent edits a file | File ownership globs overlap or are missing → fix them in `WORKFLOW.md` |

---

## 10. Updating the factory

The factory files (`.github/agents/`, `.github/instructions/`, `.github/skills/`, `.github/hooks/`, `AGENTS.md`) are generic. Update them by copying a newer version over them. `docs/` is yours and is never overwritten. After an update, reload the VS Code window so the new agent definitions load.
