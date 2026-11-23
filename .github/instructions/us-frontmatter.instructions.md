---
description: "US Frontmatter Schema — applied to docs/us/**/*.md"
applyTo: "docs/us/**/*.md"
---

# US Frontmatter Schema

Every `docs/us/US-*.md` starts with:

```yaml
---
id: US-001                       # zero-padded, unique, matches filename
title: "Short imperative title"  # quoted, single line
slug: short-imperative-title     # kebab-case, matches filename
status: draft                    # draft | spec | designed | arch | dev | reviewed | done | blocked
priority: medium                 # high | medium | low
track: null                      # light | backend | full — set at the plan gate
team: []                         # agents confirmed at the plan gate, e.g. [dev-front, tester]
issue: null                      # GitHub issue number
owner-agent: business-analyst    # agent currently in charge
created: 2026-05-19              # ISO date, immutable
updated: 2026-05-19              # ISO date, bumped on every transition
related-adrs: []                 # e.g. [ADR-0003]
tags: []
---
```

## Rules
- Filename `US-<id>-<slug>.md`; `id`, `slug` and filename match exactly.
- Created by the `new-us` skill; afterwards only the orchestrator edits frontmatter, §9 and §10.
- No extra keys without changing this file.
- US written before v2 (status `maintained`/`tested`, Test Report at §8, Changelog at §9) are legacy: leave them as they are.

## Body sections (in this order)

```markdown
## 1. Context & Goal          (business-analyst)
## 2. Acceptance Criteria     (business-analyst — Gherkin)
## 3. Out of Scope            (business-analyst)
## 4. Design                  (### UX — ux-designer · ### UI — ui-designer)
## 5. Tech Design             (architect — ends with ### Work Breakdown)
## 6. Implementation Notes    (### dev-front · ### dev-back · ### dev-devops)
## 7. Test Report             (tester)
## 8. Review Findings         (security-perf-reviewer · ### Maintenance — maintainer)
## 9. Decisions               (orchestrator — human decisions log)
## 10. Changelog              (orchestrator — one line per transition)
```
Not yet filled: `_(pending)_`. Stage outside the track: `_(skipped — <track> track)_`.
