---
name: professional-architecture-testing-contracts
description: Generate typed clients between Angie backend and frontend instead of hand-written fetch calls, and split tests into three tiers (unit, integration, e2e) so CI stays fast and failures point to the right layer. Use when frontend code is calling `fetch('/api/...')` directly, when backend response shapes are duplicated as types, when CI takes too long because everything is e2e, when a DTO change should break the consumer at compile time, or when designing a test strategy for a new domain.
---

# Testing and Contracts (Angie)

The frontend should never guess what the backend returns, and tests should fail in the layer where the bug lives. Two rules carry both.

Rules in this skill: 15 (generated client, not raw fetch), 32 (three test tiers — unit, integration, e2e).

---

## 15. Backend ↔ frontend communication via a generated client, not `fetch`

Every domain with a backend produces a client (OpenAPI / tRPC / GraphQL codegen) as part of its `data-access` lib. The frontend does not write `fetch('/api/...')` by hand.

**Why it matters**
- An endpoint change breaks the compile, not the runtime.
- No more "what's the response shape?" — the type is guaranteed.
- Removes the need to maintain types twice (see also `professional-architecture-monorepo-hygiene` rule 13).

❌ Bad:

```typescript
// everywhere it's needed
const res = await fetch(`/api/sites/${id}`);
const data = await res.json() as any;
// what fields? who knows. backend change? runtime errors.
```

✅ Good:

```typescript
// libs/sites-management/data-access/src/lib/client.ts
// generated from OpenAPI / tRPC
export const sitesClient = createClient<SitesAPI>();

// in a consumer
const site = await sitesClient.sites.get({ id });
// site is fully typed. backend change? immediate compile error.
```

Pipeline: `nx run api:export-openapi` (writes spec JSON) → `nx run sites-management-data-access:generate-client` (writes typed client). A breaking change shows up in PR CI.

---

## 32. Testing — three tiers, not one

NestJS invites writing everything as e2e with `Test.createTestingModule`. That's a mistake. Three tiers:

- **Unit** — service or utility, no NestJS DI, mocks by hand. Fast, focused.
- **Integration** — module wired up with `Test.createTestingModule`, real DB (testcontainers), no HTTP. Verifies wiring.
- **E2E** — full app with `supertest`. Verifies public contracts.

**Why it matters**
- If everything is e2e, CI takes 40 minutes and rule 2 (`nx affected`) doesn't help.
- Tiers tell you where the bug is: unit fails → logic. integration fails → wiring. e2e fails → contract.

✅ Good:

```typescript
// 1. Unit — fast, no NestJS
describe('SitesService', () => {
  it('rejects duplicate slugs', async () => {
    const repo: SitesRepository = { findBySlug: async () => ({ id: '1' } as Site), /* ... */ };
    const service = new SitesService(repo);
    await expect(service.create({ slug: 'taken' })).rejects.toThrow(DuplicateSlugError);
  });
});

// 2. Integration — module wired, real DB
describe('SitesModule (integration)', () => {
  let app: TestingModule;
  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [SitesModule, TestDbModule],
    }).compile();
  });
  // verifies wiring + SQL
});

// 3. E2E — full app
describe('Sites API (e2e)', () => {
  it('POST /sites creates a site', async () => {
    await request(app.getHttpServer())
      .post('/sites')
      .send({ name: 'Test', slug: 'test' })
      .expect(201);
  });
});
```

`nx affected --target=test` runs all three. Unit is seconds, integration is tens of seconds, e2e is minutes — and most don't run on most PRs.

---

## How they interact

The generated client (rule 15) gives e2e tests a typed surface to call, and gives unit tests on the frontend a real type to mock against. The three-tier split (rule 32) keeps the cost of having strong contract tests low.
