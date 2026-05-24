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

Schemas and types — one source of truth

## Why it matters

- Two seemingly-identical types will diverge within 3 months. One gets a new field, the other doesn't, and you have a silent bug.
- With Zod or similar, the same schema gives you runtime validation and a compile-time type.
- someone added ownerId on one side only



## How to fix

The `Site` type isn't written twice. It lives in one library (usually `data-access` or a dedicated schemas lib), and both server and client import from it.

## Incorrect

```typescript
// apps/api/src/types/site.ts
export type Site = { id: string; name: string; slug: string; };

// apps/frontend/src/types/site.ts
export type Site = { id: string; name: string; slug: string; ownerId: string; };
// someone added ownerId on one side only
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
```
