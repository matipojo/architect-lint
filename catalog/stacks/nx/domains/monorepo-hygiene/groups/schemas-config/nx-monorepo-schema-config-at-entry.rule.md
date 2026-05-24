---
id: nx-monorepo-schema-config-at-entry
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
  - nestjs-config-module-not-process-env
---

# Configuration is read at the entry point, not in the middle of the code

No surprises. All settings in one reviewable place.

## Why it matters

- No surprises. All settings in one reviewable place.
- Validation at startup — if a var is missing, the app doesn't boot. Better than crashing an hour later.
- Tests receive config as a prop, not by stubbing `process.env`.

## Issues

- [reliability] Without this: validation at startup — if a var is missing, the app doesn't boot. Better than crashing an hour later.
- [testability] Without this: tests receive config as a prop, not by stubbing `process.env`.
- [governance] Without this: failure mode: no surprises. All settings in one reviewable place.
- [governance] Failure mode: no surprises. All settings in one reviewable place.

## How to fix

`process.env.X` or `import.meta.env.X` appears in one place — the app's config file. The rest of the code receives typed values, doesn't read env vars directly.

## Incorrect

```typescript
// scattered everywhere
const apiKey  = process.env.OPENAI_API_KEY;
const dbUrl   = process.env.DATABASE_URL ?? 'postgres://localhost';
const timeout = parseInt(process.env.TIMEOUT_MS ?? '5000');
```

## Correct

```typescript
// apps/studio/src/config.ts
import { z } from 'zod';

const ConfigSchema = z.object({
  openaiApiKey: z.string().min(1),
  databaseUrl:  z.string().url(),
  timeoutMs:    z.coerce.number().default(5000),
});

export const config = ConfigSchema.parse({
  openaiApiKey: process.env.OPENAI_API_KEY,
  databaseUrl:  process.env.DATABASE_URL,
  timeoutMs:    process.env.TIMEOUT_MS,
});

// everywhere else
import { config } from './config';
```
