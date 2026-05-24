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

Without rate limiting, the login endpoint is open to brute force; an expensive endpoint is open to DoS.

## Why it matters

- Without rate limiting, the login endpoint is open to brute force; an expensive endpoint is open to DoS.
- "We'll handle it later" = never.

## Issues

- [security] login endpoints are open to brute force without per-route throttling.
- [security] expensive endpoints have no protection against intentional or accidental DoS.


## How to fix

`@nestjs/throttler` on every endpoint. CSRF token on every state-changing operation from a cookie-based client. Baseline headers via `helmet` by default.

## Incorrect

```typescript
@Post('login')
async login(@Body() dto: LoginDto) {
  return this.auth.login(dto);
}
```

## Correct

```typescript
// global
ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }])

// stricter on sensitive endpoints
@Throttle({ default: { ttl: 60_000, limit: 5 } })
@Post('login')
async login() { /* ... */ }
```
