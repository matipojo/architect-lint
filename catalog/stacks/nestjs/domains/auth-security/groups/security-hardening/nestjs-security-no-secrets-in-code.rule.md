---
id: nestjs-security-no-secrets-in-code
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

# Secrets don't sit in code or logs

A leaked secret = a secret leaked to anyone with access to Datadog/Loki. Rotation is the only fix.

## Why it matters

- A leaked secret = a secret leaked to anyone with access to Datadog/Loki. Rotation is the only fix.
- Without an automatic redactor, the moment a log prints a request body, passwords leak.

## Issues

- [security] Without this: body contains password
- [security] Without this: a leaked secret = a secret leaked to anyone with access to Datadog/Loki. Rotation is the only fix.
- [security] Without this: failure mode: without an automatic redactor, the moment a log prints a request body, passwords leak.
- [security] Failure mode: without an automatic redactor, the moment a log prints a request body, passwords leak.

## How to fix

API keys, JWT secrets, DB passwords — only via `ConfigService`. And never in logs. A logging interceptor strips dangerous values automatically.

## Incorrect

```typescript
logger.info({ event: 'login_attempt', body: req.body });
// body contains password
```

## Correct

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
