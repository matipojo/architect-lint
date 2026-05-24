---
id: nestjs-testing-generated-client-not-fetch
stack: nestjs
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
related:
  - nx-monorepo-schema-single-source
  - nestjs-config-openapi-from-code
---

# Backend ↔ frontend communication via a generated client, not `fetch`

Hand-written fetch — API changes fail in the browser, not at compile time.

## Why it matters

- [api-drift] Hand-written fetch strings — backend renames compile fine and fail in the user's browser.
- [agent-gets-lost] Response shape lives in someone's head — backend adds a field, frontend finds out in prod.
- [api-drift] Types maintained twice — OpenAPI, hand types, and runtime behavior disagree within a sprint.

## How to fix

Every domain with a backend produces a client (OpenAPI / tRPC / GraphQL codegen) as part of its `data-access` lib. The frontend does not write `fetch('/api/...')` by hand.

## Incorrect

```typescript
// everywhere it's needed
const res = await fetch(`/api/sites/${id}`);
const data = await res.json() as any;
// what fields? who knows. backend change? runtime errors.
```

## Correct

```typescript
// libs/sites-management/data-access/src/lib/client.ts
// generated from OpenAPI / tRPC
export const sitesClient = createClient<SitesAPI>();

// in a consumer
const site = await sitesClient.sites.get({ id });
// site is fully typed. backend change? immediate compile error.
```
