---
id: react-platform-version-public-contracts
stack: react
domain: platform-composition
group: composition
status: active
replaced_by: null
since: 2026-05-01
tags:
  - react
  - platform
  - composition
priority: high
related: []
---

# Version your public contracts

Without versioning, every change becomes a cross-team coordination project.

## Why it matters

- Without versioning, every change becomes a cross-team coordination project.
- Versioning is what lets domains evolve independently.
- next week — breaking change, no warning



## How to fix

The `data-access` lib of a domain is a contract. A breaking change to its public API = a new entry, not a delete of the old one. Consumers migrate at their own pace.

## Incorrect

```typescript
// libs/sites-management/data-access/src/index.ts
// this week
export function getSite(id: string): Promise<Site>;
// next week — breaking change, no warning
export function getSite(id: string, options: GetSiteOptions): Promise<SiteWithMeta>;
```

## Correct

```json
{
  "name": "@acme/sites-management-data-access",
  "exports": {
    ".":    "./src/index.ts",
    "./v1": "./src/v1/index.ts",
    "./v2": "./src/v2/index.ts"
  }
}
```
