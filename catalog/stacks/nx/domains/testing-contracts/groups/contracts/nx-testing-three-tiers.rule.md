---
id: nx-testing-three-tiers
stack: nx
domain: testing-contracts
group: contracts
status: active
replaced_by: null
since: 2026-05-01
tags:
  - testing
  - openapi
  - contracts
priority: medium
related: []
---

# Testing — three tiers, not one

Three test tiers — unit, integration, e2e — so CI stays fast and a red test names the broken layer.

## Why it matters

- [slow-ci] If everything is e2e, CI takes 40 minutes and `nx affected` can't trim the test graph.
- [unclear-failure] One red e2e — is it logic, wiring, or API? Hours split across layers before anyone knows.
- [api-drift] Backend changes a response field — no contract or integration test fails until a browser run, if that path is covered at all.



## How to fix

NestJS invites writing everything as e2e with `Test.createTestingModule`. That's a mistake. Three tiers:

- **Unit** — service or utility, no NestJS DI, mocks by hand. Fast, focused.
- **Integration** — module wired up with `Test.createTestingModule`, real DB (testcontainers), no HTTP. Verifies wiring.
- **E2E** — full app with `supertest`. Verifies public contracts.

## Incorrect

```typescript
describe('Everything (e2e)', () => {
  it('creates a site end-to-end', async () => {
    await request(app.getHttpServer())
      .post('/sites')
      .send({ name: 'Test', slug: 'test' })
      .expect(201);
  });
});
```

## Correct

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
