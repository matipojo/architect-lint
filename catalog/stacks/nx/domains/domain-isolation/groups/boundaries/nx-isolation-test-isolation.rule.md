---
id: nx-isolation-test-isolation
stack: nx
domain: domain-isolation
group: boundaries
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nx
  - monorepo
  - domain-driven-design
priority: high
related: []
---

# Full test isolation

Without this, rule 1 is empty words — if tests need the whole system, dependencies live in code even if invisible.

## Why it matters

- Without this, rule 1 is empty words — if tests need the whole system, dependencies live in code even if invisible.
- CI times stay sane as the system grows.
- When a test fails, it's clear who broke what.

## Issues

- [testability] Without this: cI times stay sane as the system grows.
- [blast-radius] Without this: failure mode: without this, rule 1 is empty words — if tests need the whole system, dependencies live in code even if invisible.
- [testability] Without this: failure mode: when a test fails, it's clear who broke what.
- [blast-radius] Failure mode: without this, rule 1 is empty words — if tests need the whole system, dependencies live in code even if invisible.
- [testability] Failure mode: when a test fails, it's clear who broke what.

## How to fix

`nx affected:test` is the default. CI runs only the tests for what changed.

## Incorrect

```yaml
# .github/workflows/ci.yml
- run: pnpm nx run-many --target=test --all
```

## Correct

```yaml
- run: pnpm nx affected --target=test --base=origin/main
- run: pnpm nx affected --target=lint --base=origin/main
- run: pnpm nx affected --target=build --base=origin/main
```
