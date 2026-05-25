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
  - browser-to-server
priority: medium
related:
  - nx-monorepo-schema-single-source
  - nestjs-config-openapi-from-code
  - integrations-third-party-dedicated-client-module
  - nestjs-module-cross-module-via-services
---

# Browser → server: generated data-access client, not `fetch`

**Scope: browser → server** (client-to-server). Browser or mobile app calling your own `/api/...` — not server-to-vendor calls, not server-to-server between your domains.

Hand-written fetch to your API — changes fail in the browser, not at compile time.

## Why it matters

- [api-drift] Hand-written fetch strings — backend renames compile fine and fail in the user's browser.
- [agent-gets-lost] Response shape lives in someone's head — backend adds a field, frontend finds out in prod.
- [api-drift] Types maintained twice — OpenAPI, hand types, and runtime behavior disagree within a sprint.

## How to fix

Every domain with a backend produces a frontend `data-access` client (OpenAPI / tRPC / GraphQL codegen). UI and feature code import that client — they do not write `fetch('/api/...')` by hand. Server-to-vendor calls use a dedicated integration client. Server-to-internal domain calls use exported NestJS services, not HTTP between your own modules.

## Incorrect

```typescript
// frontend component — calling your own backend, not an external vendor
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
