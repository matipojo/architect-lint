---
id: nestjs-security-authorize-from-db-object
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

# Always authorize on an object loaded from the DB, not on user input

Authorizing on input = trusting the user. They can send another tenant's ID.

## Why it matters

- [data-leak] Authorizing on input = trusting the user. They can send another tenant's ID.
- [data-leak] IDOR (Insecure Direct Object Reference) is the most common vulnerability. The order — fetch then authorize — neutralizes it.


## How to fix

The user sends `siteId`. You don't authorize on the ID — you load the site and authorize on the loaded object. If it doesn't exist — `NotFoundException`. Only then check whether the user may act on it.

## Incorrect

```typescript
async deleteSite(siteId: string, user: User) {
  if (!user.canDeleteSites) throw new ForbiddenException();   // ← generic permission
  await this.repo.delete(siteId);                              // ← deletes any site
}
```

## Correct

```typescript
async deleteSite(siteId: string, user: User) {
  const site = await this.repo.findById(siteId);
  if (!site) throw new NotFoundException();
  if (!this.policy.canDelete(user, site)) throw new ForbiddenException();
  await this.repo.delete(siteId);
}
```
