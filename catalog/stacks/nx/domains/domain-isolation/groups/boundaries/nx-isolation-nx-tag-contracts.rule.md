---
id: nx-isolation-nx-tag-contracts
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

# Explicit cross-domain contracts via Nx tags

The moment one domain reaches into another's internals, rule 1 silently breaks.

## Why it matters

- The moment one domain reaches into another's internals, rule 1 silently breaks.
- Internal changes must not break consumers — if they do, you have hidden coupling.
- The public API is the only surface that needs strict review.


## How to fix

A domain may not import from `src/` of another domain. Only via the library barrel (`index.ts`). Nx enforces this with tags.

## Incorrect

```typescript
// apps/workspace/src/workflow-builder.ts
import { SiteModel } from '../../../libs/sites-management/data-access/src/lib/internal/models/site';
import { validateSlug } from '../../../libs/sites-management/data-access/src/lib/utils/validation';
```

## Correct

```json
{
  "rules": {
    "@nx/enforce-module-boundaries": ["error", {
      "depConstraints": [
        { "sourceTag": "domain:studio",            "onlyDependOnLibsWithTags": ["domain:studio", "domain:shared"] },
        { "sourceTag": "domain:sites-management",  "onlyDependOnLibsWithTags": ["domain:sites-management", "domain:shared"] },
        { "sourceTag": "domain:shared",            "onlyDependOnLibsWithTags": ["domain:shared"] },
        { "sourceTag": "type:feature",             "onlyDependOnLibsWithTags": ["type:feature", "type:data-access", "type:ui", "type:util"] },
        { "sourceTag": "type:ui",                  "onlyDependOnLibsWithTags": ["type:ui", "type:util"] }
      ]
    }]
  }
}
```
