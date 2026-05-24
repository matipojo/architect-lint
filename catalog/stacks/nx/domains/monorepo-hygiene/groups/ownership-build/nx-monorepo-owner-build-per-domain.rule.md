---
id: nx-monorepo-owner-build-per-domain
stack: nx
domain: monorepo-hygiene
group: ownership-build
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nx
  - monorepo
  - documentation
priority: medium
related: []
---

# Build artifacts are per-domain

Each domain produces its own build artifact — deploy, rollback, and monitor independently.

## Why it matters

- [cant-rollback] If deploy is monolithic, domain separation is theory — in practice you have one app.

## How to fix

`nx build sites-management` produces a standalone artifact. You can deploy it alone, roll it back alone, monitor it alone.

## Incorrect

```text
nx build platform-shell  # one artifact, all domains deploy together
```

## Correct

```bash
nx build sites-management  # standalone artifact per domain
nx build billing           # deploy, rollback, monitor independently
```
