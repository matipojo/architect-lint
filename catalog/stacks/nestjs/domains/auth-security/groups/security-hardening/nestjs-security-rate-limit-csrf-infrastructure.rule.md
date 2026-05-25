---
id: nestjs-security-rate-limit-csrf-infrastructure
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
priority: medium
related: []
---

# Rate limiting and CSRF are infrastructure, not optional

Rate limiting and CSRF ship as shared infrastructure — wired once, not bolted on per route later.

## Why it matters

- [abuse-vulnerable] Without rate limiting, the login endpoint is open to brute force; an expensive endpoint is open to DoS.
- [abuse-vulnerable] State-changing endpoints without CSRF protection are reachable from any site the user visits in a cookie-authenticated session.
- [agent-gets-lost] "We'll handle it later" = never — bolted-on-per-route security is always partial.

## How to fix

`@nestjs/throttler` on every endpoint. CSRF token on every state-changing operation from a cookie-based client. Baseline headers via `helmet` by default. All three ship as global infrastructure — wired once in `AppModule` / `main.ts`, not bolted on per route later.

## Incorrect

```typescript
// apps/api/src/main.ts — no helmet, no CSRF
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

// apps/api/src/auth/auth.controller.ts — no throttling
@Post('login')
async login(@Body() dto: LoginDto) {
  return this.auth.login(dto);
}
```

## Correct

```typescript
// apps/api/src/main.ts
import helmet from 'helmet';
import { doubleCsrf } from 'csrf-csrf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  const { doubleCsrfProtection } = doubleCsrf({
    getSecret: () => config.CSRF_SECRET,
    cookieName: '__Host-csrf',
    cookieOptions: { sameSite: 'strict', secure: true, httpOnly: true },
  });
  app.use(doubleCsrfProtection);

  await app.listen(3000);
}

// apps/api/src/app.module.ts
@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

// apps/api/src/auth/auth.controller.ts — stricter per route
@Throttle({ default: { ttl: 60_000, limit: 5 } })
@Post('login')
async login(@Body() dto: LoginDto) {
  return this.auth.login(dto);
}
```
