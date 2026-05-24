---
id: nestjs-auth-one-passport-strategy-per-method
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
priority: medium
related: []
---

# Passport Strategies — one per auth method, no more

One huge Strategy with `if`s = you can't add a new auth method without risking the existing ones.

## Why it matters

- [hard-to-change] One huge Strategy with `if`s = you can't add a new auth method without risking the existing ones.
- [hard-to-change] One mega-Strategy with if/else per auth method — adding OAuth risks breaking JWT login.
- [hard-to-change] adding OAuth or API keys means editing one Strategy full of conditionals.
- [spreads-failure] a bug in one auth branch breaks every endpoint using that Strategy.

## How to fix

NestJS + Passport invites `JwtStrategy`, `LocalStrategy`, `ApiKeyStrategy`. Each lives in its own file, and makes no business decisions.

## Incorrect

```typescript
@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  async validate(req: Request): Promise<User> {
    const apiKey = req.headers['x-api-key'];
    if (apiKey) return this.apiKeys.resolveOwner(String(apiKey));
    const token = extractJwt(req);
    return this.users.findById(token.sub);
  }
}
```

## Correct

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
