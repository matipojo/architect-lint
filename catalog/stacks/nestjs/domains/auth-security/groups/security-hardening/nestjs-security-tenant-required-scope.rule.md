---
id: nestjs-security-tenant-required-scope
stack: nestjs
domain: auth-security
group: security-hardening
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nestjs
  - security
  - auth
priority: high
related: []
---

# Multi-tenancy — tenant is a required scope, not a reminder

One forgotten filter = a user sees another org's data. The most severe leak there is.

## Why it matters

- One forgotten filter = a user sees another org's data. The most severe leak there is.
- After 6 months no one remembers which repository filters and which doesn't.

## Issues

- [security] One forgotten filter = a user sees another org's data. The most severe leak there is.
- [maintainability] After 6 months no one remembers which repository filters and which doesn't.


## How to fix

If you have organizations/accounts, every query is filtered by tenant automatically. Not "remember to add `where: { orgId }`" — that will fail. Use `RequestContext`, `AsyncLocalStorage`, or row-level security in the DB.

## Incorrect

```typescript
async listSites(user: User) {
  return this.repo.find();   // ← all sites, every org
}

async listSitesV2(user: User) {
  return this.repo.find({ where: { orgId: user.orgId } });   // ← correct, but relies on memory
}
```

## Correct

```typescript
// libs/shared/backend-tenancy/src/lib/tenant-context.ts
@Injectable()
export class TenantContext {
  private storage = new AsyncLocalStorage<{ orgId: string }>();
  run<T>(orgId: string, fn: () => T): T { return this.storage.run({ orgId }, fn); }
  get orgId(): string {
    const ctx = this.storage.getStore();
    if (!ctx) throw new Error('No tenant in context');
    return ctx.orgId;
  }
}

// middleware
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    this.tenant.run(req.user.orgId, () => next());
  }
}

// repository — filters automatically, can't be bypassed
@Injectable()
export class SitesRepository {
  async find() {
    return this.db.site.findMany({ where: { orgId: this.tenant.orgId } });
  }
}
```
