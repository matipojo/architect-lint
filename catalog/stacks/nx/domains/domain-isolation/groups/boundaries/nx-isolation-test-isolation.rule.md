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

Domain tests boot only their domain — not the whole platform graph.

## Why it matters

- [spreads-failure] Without this, rule 1 is empty words — if tests need the whole system, dependencies live in code even if invisible.
- [slow-ci] Domain tests boot the whole platform — CI minutes climb with every new app added.
- [unclear-failure] Shared test setup fails — every domain is red until someone finds the one bad import.

## How to fix

`nx affected:test` is the default. CI runs only the tests for what changed. Each domain's tests use that domain's code only — no cross-domain `setupX()` helpers or unrelated mocks.

A test that needs the whole system up = red flag the architecture is wrong.

## Incorrect

```typescript
// .github/workflows/ci.yml
// - run: pnpm nx run-many --target=test --all

// apps/catalog/tests/item-creation.test.ts
import { setupWorkspace } from '../../workspace/test-helpers';
import { mockWorkflowRuntime } from '../../workspace/mocks';

test('creates an item', async () => {
  await setupWorkspace();           // why?
  mockWorkflowRuntime();            // unrelated to catalog
  const item = await createItem();
  expect(item).toBeDefined();
});
```

## Correct

```typescript
// .github/workflows/ci.yml
// - run: pnpm nx affected --target=test --base=origin/main
// - run: pnpm nx affected --target=lint --base=origin/main
// - run: pnpm nx affected --target=build --base=origin/main

// apps/catalog/tests/item-creation.test.ts
import { createItem } from '../src/items';

test('creates an item', async () => {
  const item = await createItem({ name: 'My Item' });
  expect(item.id).toBeDefined();
});
```
