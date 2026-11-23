---
name: new-us
description: "Creates docs/us/US-XXX-<slug>.md with valid frontmatter and the section skeleton. Auto-increments the id. Used by the business-analyst."
---

# new-us

Inputs: `title` (required) · `priority` (default `medium`) · `issue` (GitHub number, default `null`).

1. **Id**: max numeric part of `docs/us/US-*.md` + 1, 3-digit zero-padded (`US-001` if none).
2. **Slug**: lowercase title, non-alphanumeric runs → `-`, trim `-`, ≤ 50 chars (cut at the last `-`).
3. **Create** `docs/us/US-<id>-<slug>.md` — never overwrite; if it exists, increment and retry:

```markdown
---
id: US-<id>
title: "<title>"
slug: <slug>
status: draft
priority: <priority>
track: null
team: []
issue: <issue>
owner-agent: business-analyst
created: <today>
updated: <today>
related-adrs: []
tags: []
---

# US-<id> — <title>

## 1. Context & Goal
_(pending)_

## 2. Acceptance Criteria
_(pending)_

## 3. Out of Scope
_(pending)_

## 4. Design
_(pending)_

## 5. Tech Design
_(pending)_

## 6. Implementation Notes
_(pending)_

## 7. Test Report
_(pending)_

## 8. Review Findings
_(pending)_

## 9. Decisions
_(none yet)_

## 10. Changelog
- <today> — new-us: skeleton created
```

4. Report the path. No business content: that's the BA's job.
