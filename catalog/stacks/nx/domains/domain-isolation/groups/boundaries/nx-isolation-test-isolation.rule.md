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

- [spreads-failure] Without this, rule 1 is empty words — if tests need the whole system, dependencies live in code even if invisible.
- [slow-ci] Domain tests boot the whole platform — CI minutes climb with every new app added.
- [unclear-failure] Shared test setup fails — every domain is red until someone finds the one bad import.

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
