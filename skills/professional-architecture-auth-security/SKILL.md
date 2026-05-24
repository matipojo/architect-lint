---
name: professional-architecture-auth-security
description: Separate authentication from authorization in Angie, keep one Passport strategy per auth method, express permissions as testable Policy classes, always authorize on a DB-loaded resource (never on raw client input), enforce multi-tenant scoping at the data layer, keep secrets out of code and logs, and make rate limiting/CSRF/security headers infrastructure-default. Use when adding auth to an endpoint, when an `AuthGuard` starts deciding business permissions, when reviewing IDOR risk, when a new tenant-scoped query is added, or when wiring throttling, CORS, or helmet.
---

# Authentication, Authorization, and Security (Angie)

Auth bugs are the most expensive bugs. These rules keep the most common categories — identity confusion, IDOR, tenant leakage, secret leaks, brute force — out of the codebase by default.

Rules in this skill: 34 (authn vs authz are different layers), 35 (one Passport strategy per method), 36 (policies, not decorators), 37 (authorize on the DB-loaded object), 38 (multi-tenancy is a mandatory scope), 39 (no secrets in code or logs), 40 (rate limiting and CSRF are infrastructure).

---

## 34. Authentication and Authorization are two different layers

Authentication = who you are. Authorization = what you can do. They don't live in the same guard, and they don't live in the same service. Mixing them is the source of the most painful security bugs.

**Why it matters**
- When `AuthGuard` both authenticates and decides permissions, you can't swap auth method (JWT → session, OAuth → API key) without touching every permission check.
- Permission checks belong inside the domain that knows the resource. Auth checks are cross-cutting infrastructure.

❌ Bad:

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

✅ Good:

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

`JwtAuthGuard` only identifies. `SitesService` decides if this user can read this specific site.

---

## 35. Passport Strategies — one per auth method, no more

NestJS + Passport invites `JwtStrategy`, `LocalStrategy`, `ApiKeyStrategy`. Each lives in its own file, and makes no business decisions.

**Why it matters**
- One huge Strategy with `if`s = you can't add a new auth method without risking the existing ones.
- Each strategy answers exactly one question: "who is the user on this request?"

✅ Good:

```typescript
// libs/shared/backend-auth/src/lib/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  async validate(payload: JwtPayload): Promise<User> {
    return this.users.findById(payload.sub);
  }
}

// libs/shared/backend-auth/src/lib/api-key.strategy.ts
@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'api-key') {
  async validate(apiKey: string): Promise<User> {
    return this.apiKeys.resolveOwner(apiKey);
  }
}

// usage — pick a strategy per endpoint
@UseGuards(AuthGuard('jwt'))      // user via UI
@UseGuards(AuthGuard('api-key'))  // external integration
@UseGuards(AuthGuard(['jwt', 'api-key']))  // both
```

---

## 36. Authorization = Policies, not decorators sprinkled across the code

Not `@RequireRole('admin')`, not `@CanAccess('sites:write')` on the controller. A permission is a question about a user and a resource, and the answer lives in a policy function you can test and reuse.

**Why it matters**
- Decorators scatter permissions across dozens of places. A policy change = grep across the project.
- The same permission needs to apply both in the UI (hide a button) and in the backend. One policy = two consumers.
- A decorator gets the user but not the resource. Most real permissions are about a specific resource.

❌ Bad:

```typescript
@Controller('sites')
export class SitesController {
  @Patch(':id')
  @RequireRole('admin')                          // ← admin of what?
  async update(@Param('id') id: string) { /* ... */ }

  @Delete(':id')
  @RequirePermission('sites:delete')             // ← but the owner can also delete
  async delete(@Param('id') id: string) { /* ... */ }
}
```

✅ Good:

```typescript
// libs/sites-management/backend-feature/src/lib/sites.policy.ts
@Injectable()
export class SitesPolicy {
  canRead(user: User, site: Site): boolean {
    return site.isPublic || site.ownerId === user.id || user.role === 'admin';
  }
  canUpdate(user: User, site: Site): boolean {
    return site.ownerId === user.id || user.role === 'admin';
  }
  canDelete(user: User, site: Site): boolean {
    if (site.protected) return user.role === 'admin';
    return site.ownerId === user.id;
  }
}

// in the service
async update(siteId: string, user: User, dto: UpdateSiteDto) {
  const site = await this.repo.findById(siteId);
  if (!this.policy.canUpdate(user, site)) throw new ForbiddenException();
  return this.repo.update(siteId, dto);
}
```

The policy is in one place. Unit-testable. Exposable to the frontend as `canUpdate(site)` to hide buttons.

---

## 37. Always authorize on an object loaded from the DB, not on user input

The user sends `siteId`. You don't authorize on the ID — you load the site and authorize on the loaded object. If it doesn't exist — `NotFoundException`. Only then check whether the user may act on it.

**Why it matters**
- Authorizing on input = trusting the user. They can send another tenant's ID.
- IDOR (Insecure Direct Object Reference) is the most common vulnerability. The order — fetch then authorize — neutralizes it.

❌ Bad:

```typescript
async deleteSite(siteId: string, user: User) {
  if (!user.canDeleteSites) throw new ForbiddenException();   // ← generic permission
  await this.repo.delete(siteId);                              // ← deletes any site
}
```

✅ Good:

```typescript
async deleteSite(siteId: string, user: User) {
  const site = await this.repo.findById(siteId);
  if (!site) throw new NotFoundException();
  if (!this.policy.canDelete(user, site)) throw new ForbiddenException();
  await this.repo.delete(siteId);
}
```

---

## 38. Multi-tenancy — tenant is a required scope, not a reminder

If you have organizations/accounts, every query is filtered by tenant automatically. Not "remember to add `where: { orgId }`" — that will fail. Use `RequestContext`, `AsyncLocalStorage`, or row-level security in the DB.

**Why it matters**
- One forgotten filter = a user sees another org's data. The most severe leak there is.
- After 6 months no one remembers which repository filters and which doesn't.

❌ Bad:

```typescript
async listSites(user: User) {
  return this.repo.find();   // ← all sites, every org
}

async listSitesV2(user: User) {
  return this.repo.find({ where: { orgId: user.orgId } });   // ← correct, but relies on memory
}
```

✅ Good:

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

Even stronger: row-level security in Postgres. The DB itself refuses to return another org's rows even if you forget.

---

## 39. Secrets don't sit in code or logs

API keys, JWT secrets, DB passwords — only via `ConfigService`. And never in logs. A logging interceptor strips dangerous values automatically.

**Why it matters**
- A leaked secret = a secret leaked to anyone with access to Datadog/Loki. Rotation is the only fix.
- Without an automatic redactor, the moment a log prints a request body, passwords leak.

❌ Bad:

```typescript
logger.info({ event: 'login_attempt', body: req.body });
// body contains password
```

✅ Good:

```typescript
// libs/shared/backend-observability/src/lib/redact.ts
const SENSITIVE = ['password', 'token', 'apiKey', 'secret', 'authorization'];

export function redact(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    SENSITIVE.some(s => key.toLowerCase().includes(s)) ? '[REDACTED]' : value
  ));
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest();
    this.log.info({ method: req.method, path: req.path, body: redact(req.body) });
    return next.handle();
  }
}
```

---

## 40. Rate limiting and CSRF are infrastructure, not optional

`@nestjs/throttler` on every endpoint. CSRF token on every state-changing operation from a cookie-based client. Baseline headers via `helmet` by default.

**Why it matters**
- Without rate limiting, the login endpoint is open to brute force; an expensive endpoint is open to DoS.
- "We'll handle it later" = never.

✅ Good:

```typescript
// global
ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }])

// stricter on sensitive endpoints
@Throttle({ default: { ttl: 60_000, limit: 5 } })
@Post('login')
async login() { /* ... */ }
```
