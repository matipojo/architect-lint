---
id: nestjs-auth-separate-authn-authz
stack: nestjs
domain: auth-security
group: authn-authz
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

# Authentication and Authorization are two different layers

Authentication and Authorization are two different layers

## Why it matters

- When `AuthGuard` both authenticates and decides permissions, you can't swap auth method (JWT → session, OAuth → API key) without touching every permission check.
- Permission checks belong inside the domain that knows the resource. Auth checks are cross-cutting infrastructure.

## Issues

- [maintainability] When `AuthGuard` both authenticates and decides permissions, you can't swap auth method (JWT → session, OAuth → API key) without touching every permission check.
- [maintainability] Permission checks belong inside the domain that knows the resource. Auth checks are cross-cutting infrastructure.


## How to fix

Authentication = who you are. Authorization = what you can do. They don't live in the same guard, and they don't live in the same service. Mixing them is the source of the most painful security bugs.

## Incorrect

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return false;
    const user = await this.jwt.verify(token);
    req.user = user;

    // ← starts knowing about domains
    const path = req.url;
    if (path.startsWith('/sites/') && !user.canManageSites) return false;
    if (path.startsWith('/studio/') && !user.isPro) return false;
    return true;
  }
}
```

## Correct

```typescript
// libs/shared/backend-auth/src/lib/jwt-auth.guard.ts — infrastructure
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const token = extractToken(req);
    if (!token) throw new UnauthorizedException();
    req.user = await this.jwt.verify(token);
    return true;
  }
}

// libs/sites-management/backend-feature/src/lib/sites.controller.ts
@UseGuards(JwtAuthGuard)
@Controller('sites')
export class SitesController {
  @Get(':id')
  async get(@Param('id') id: string, @CurrentUser() user: User) {
    return this.sites.getForUser(id, user);
  }
}

// libs/sites-management/backend-feature/src/lib/sites.service.ts
async getForUser(siteId: string, user: User): Promise<Site> {
  const site = await this.repo.findById(siteId);
  if (!site) throw new NotFoundException();
  if (!this.policy.canRead(user, site)) throw new ForbiddenException();
  return site;
}
```
