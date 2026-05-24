---
id: nestjs-config-module-not-process-env
stack: nestjs
domain: nestjs-modules
group: configuration
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nestjs
  - modules
  - openapi
priority: medium
related:
  - nx-monorepo-schema-config-at-entry
---

# Configuration via ConfigModule, not `process.env`

Inject ConfigService — services never read `process.env` directly.

## Why it matters

- [hard-to-test] A service that reads `process.env` directly is not testable — you can't fake configuration.
- [drops-connection] Validation at boot means the app won't start if a var is missing.


## How to fix

NestJS provides `@nestjs/config` with schema validation. Use it. Services receive an injected `ConfigService` — they don't read `process.env` directly. (This is the NestJS expression of rule 16.)

## Incorrect

```typescript
@Injectable()
export class LlmService {
  private client = new LlmClient({
    apiKey: process.env.LLM_API_KEY!,   // ← if missing, runtime crash
  });
}
```

## Correct

```typescript
// apps/api/src/config/config.schema.ts
import { z } from 'zod';

export const ConfigSchema = z.object({
  LLM_API_KEY:   z.string().min(1),
  DATABASE_URL:  z.string().url(),
  PORT:          z.coerce.number().default(3000),
});

// apps/api/src/main.ts
ConfigModule.forRoot({
  validate: (env) => ConfigSchema.parse(env),
  isGlobal: true,
});

// libs/workspace/backend-feature/src/lib/llm.service.ts
@Injectable()
export class LlmService {
  private client: LlmClient;
  constructor(config: ConfigService) {
    this.client = new LlmClient({ apiKey: config.get('LLM_API_KEY') });
  }
}
```
