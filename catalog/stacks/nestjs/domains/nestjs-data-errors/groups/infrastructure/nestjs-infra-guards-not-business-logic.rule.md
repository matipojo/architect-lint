---
id: nestjs-infra-guards-not-business-logic
stack: nestjs
domain: nestjs-data-errors
group: infrastructure
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nestjs
  - repository
  - errors
priority: medium
related: []
---

# Guards and Interceptors — cross-cutting infrastructure, not business logic

Guards authenticate and gate access — business rules stay in services where they can be tested.

## Why it matters

- [layer-mixing] A guard that contains business logic = logic hidden from the service. Bugs that take an hour to find.
- [layer-mixing] An interceptor that changes behavior = action at a distance. Who added the `if`?


## How to fix

A `Guard` answers "is this request allowed?" — it does not run business operations, doesn't query several tables, doesn't change state.
An `Interceptor` wraps the response (logging, error mapping, transformation) — it does not make business decisions.

## Incorrect

```typescript
@Injectable()
export class CanCreateSiteGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    const siteCount = await this.sitesRepo.count({ where: { ownerId: user.id } });
    if (siteCount >= 10 && !user.isPro) return false;

    if (user.trialEndsAt < new Date()) {
      await this.usersService.markTrialExpired(user.id);   // ← side effect in guard!
      return false;
    }
    return true;
  }
}
```

## Correct

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    return !!ctx.switchToHttp().getRequest().user;
  }
}

@Injectable()
export class SitesService {
  async create(userId: string, dto: CreateSiteDto): Promise<Site> {
    await this.quotas.assertCanCreateSite(userId);   // throws if not allowed
    return this.repo.create({ ...dto, ownerId: userId });
  }
}
```
