---
id: nx-isolation-deps-one-direction
stack: nx
domain: domain-isolation
group: dependencies
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

# Dependencies flow one direction

Dependencies flow one way: apps → feature → data-access → shared — shared never imports a domain.

## Why it matters

- [hidden-coupling] Once `shared` knows a domain, it's not shared anymore.
- [hidden-coupling] shared imports a domain — every new app drags another edit through platform review.

## How to fix

Layering: `apps → features → data-access/ui → util/shared`. `shared` may not know about a specific domain. `ui` may not import `feature`. Nx enforces with `type:` tags.

## Incorrect

```typescript
// libs/shared/auth/src/lib/permissions.ts
import { StudioPermissions } from '@acme/studio/permissions';
import { SitesPermissions } from '@acme/sites-management/permissions';

export function canAccess(user: User, resource: string) {
  if (resource.startsWith('studio/')) return StudioPermissions.check(user);
  if (resource.startsWith('sites/'))  return SitesPermissions.check(user);
}
```

## Correct

```typescript
// libs/shared/auth/src/lib/registry.ts
type Checker = (user: User, resource: string) => boolean;
const checkers = new Map<string, Checker>();

export function registerPermissionChecker(prefix: string, checker: Checker) {
  checkers.set(prefix, checker);
}

export function canAccess(user: User, resource: string) {
  const prefix = resource.split('/')[0];
  return checkers.get(prefix)?.(user, resource) ?? false;
}

// apps/studio/src/main.ts
import { registerPermissionChecker } from '@acme/shared/auth';
import { StudioPermissions } from '@acme/studio/feature-permissions';
registerPermissionChecker('studio', StudioPermissions.check);
```
