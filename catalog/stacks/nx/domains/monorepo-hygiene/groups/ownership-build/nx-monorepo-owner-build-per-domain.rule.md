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

If deploy is monolithic, rule 1 (domain separation) is theory. In practice you have one app.

## Why it matters

- If deploy is monolithic, rule 1 (domain separation) is theory. In practice you have one app.
- Per-domain rollback is critical when something breaks in production.

## Issues

- [blast-radius] If deploy is monolithic, rule 1 (domain separation) is theory. In practice you have one app.
- [operational] Per-domain rollback is critical when something breaks in production.


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
