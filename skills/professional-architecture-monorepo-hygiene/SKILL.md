---
name: professional-architecture-monorepo-hygiene
description: Keep the Angie Nx + pnpm monorepo healthy through documentation, single-source-of-truth schemas, configuration loaded at boot, CODEOWNERS aligned to domain boundaries, and per-domain build artifacts. Use when adding a new domain README, when defining shared types between server and client, when reading process.env in scattered places, when reviewing CI/CD pipelines, when build outputs are bundled together, or when CODEOWNERS doesn't match the actual domain layout.
---

# Monorepo Hygiene (Angie / Nx + pnpm)

Operational rules that keep the monorepo's domain isolation real, not theoretical.

Rules in this skill: 10 (per-domain documentation), 13 (single source of truth schemas), 16 (config read at bootstrap), 19 (CODEOWNERS reflect boundaries), 20 (per-domain build artifacts).

---

## 10. Documentation in a place you can't miss

Every app has a README. Every feature lib has a README. It explains: responsibility, public API, how to run alone, external dependencies.

**Why it matters**
- In a platform, a new person doesn't learn "the system" — they learn one domain at a time. The README is the entry point.
- If you can't write a short clear README, the domain isn't well-defined.

❌ Bad:

```
/apps/sites-management
  /src
  project.json
  (no README)
```

A new developer opens the folder and starts reading random files.

✅ Good:

```markdown
# Sites Management

## Responsibility
Sites, projects, organizations, users.

## Run standalone
\`\`\`bash
pnpm nx serve sites-management
# http://localhost:4201
\`\`\`

## Libraries
- `libs/sites-management/feature-*` — screens.
- `libs/sites-management/data-access` — public API. **Only this is exported to other domains.**
- `libs/sites-management/ui` — internal components.

## External dependencies
- Postgres
- No dependency on other domains. See `nx graph`.

## Owner
Team X.
```

---

## 13. Schemas and types — one source of truth

The `Site` type isn't written twice. It lives in one library (usually `data-access` or a dedicated schemas lib), and both server and client import from it.

**Why it matters**
- Two seemingly-identical types will diverge within 3 months. One gets a new field, the other doesn't, and you have a silent bug.
- With Zod or similar, the same schema gives you runtime validation and a compile-time type.

❌ Bad:

```typescript
// apps/api/src/types/site.ts
export type Site = { id: string; name: string; slug: string; };

// apps/frontend/src/types/site.ts
export type Site = { id: string; name: string; slug: string; ownerId: string; };
// someone added ownerId on one side only
```

✅ Good:

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
import { SiteSchema, type Site } from '@angie/sites-management-data-access';
```

Schema change = both sides change, automatically, at compile time.

---

## 16. Configuration is read at the entry point, not in the middle of the code

`process.env.X` or `import.meta.env.X` appears in one place — the app's config file. The rest of the code receives typed values, doesn't read env vars directly.

**Why it matters**
- No surprises. All settings in one reviewable place.
- Validation at startup — if a var is missing, the app doesn't boot. Better than crashing an hour later.
- Tests receive config as a prop, not by stubbing `process.env`.

❌ Bad:

```typescript
// scattered everywhere
const apiKey  = process.env.OPENAI_API_KEY;
const dbUrl   = process.env.DATABASE_URL ?? 'postgres://localhost';
const timeout = parseInt(process.env.TIMEOUT_MS ?? '5000');
```

When did you find out `OPENAI_API_KEY` was missing? When a user clicked the chat.

✅ Good:

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

Missing var = the app screams at boot, not at 3 AM. (For NestJS apps see `professional-architecture-nestjs-modules` rule 26.)

---

## 19. CODEOWNERS reflects the boundaries

`.github/CODEOWNERS` is mapped per domain. A PR touching `libs/studio/*` requires Studio-team approval. A PR touching `libs/shared/*` requires platform-leads approval.

**Why it matters**
- Without it, someone "just" tweaks the core at 2 AM and three domains break by morning.
- Turns rules from suggestion into process. Cannot be bypassed.

✅ Good:

```
# .github/CODEOWNERS
/apps/sites-management/      @angie/team-sites
/libs/sites-management/      @angie/team-sites
/apps/studio/                @angie/team-studio
/libs/studio/                @angie/team-studio
/libs/shared/                @angie/platform-leads
/nx.json                     @angie/platform-leads
/.github/                    @angie/platform-leads
```

A change in `shared` cannot land without platform-leads approval. Period.

---

## 20. Build artifacts are per-domain

`nx build sites-management` produces a standalone artifact. You can deploy it alone, roll it back alone, monitor it alone.

**Why it matters**
- If deploy is monolithic, rule 1 (domain separation) is theory. In practice you have one app.
- Per-domain rollback is critical when something breaks in production.

❌ Bad:

A single `nx build` producing one bundle that contains everything. One deploy. One rollback.

✅ Good:

- Each app produces its own Docker image / bundle.
- CI runs `nx affected --target=build` and only builds what changed.
- Production updates only the image of the changed domain.
