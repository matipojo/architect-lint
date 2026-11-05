---
id: nx-monorepo-schema-single-source
stack: nx
domain: monorepo-hygiene
group: schemas-config
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nx
  - monorepo
  - documentation
priority: medium
related:
  - nestjs-testing-generated-client-not-fetch
---

# Schemas and types — one source of truth

Shared types live in one library — server and client import the same schema.

## Why it matters

- [data-corruption] Two seemingly-identical types will diverge within 3 months. One gets a new field, the other doesn't, and you have a silent bug.

## How to fix

The `Site` type isn't written twice. It lives in one library (usually `data-access` or a dedicated schemas lib), and both server and client import from it.

A shared type belongs in the package that owns it. Apps import it from that package — they never redefine or copy it locally.

## Incorrect

```typescript
// apps/api/src/types/site.ts
export type Site = { id: string; name: string; slug: string; };

// apps/frontend/src/types/site.ts
export type Site = { id: string; name: string; slug: string; ownerId: string; };
// someone added ownerId on one side only

// apps/studio-web/src/review-labels.ts — copy of a type owned by packages/agent-review
export type AgentReviewDimension = 'safety' | 'consistency';
```

## Correct

```typescript
// libs/sites-management/data-access/src/lib/schemas.ts
import { z } from 'zod';

export const SiteSchema = z.object({
  id:    z.string(),
  name:  z.string(),
  slug:  z.string(),
});
export type Site = z.infer<typeof SiteSchema>;

// both sides
import { SiteSchema, type Site } from '@acme/sites-management-data-access';

// apps import from the owning package
import type { AgentReviewDimension } from '@acme/agent-review';
```
