---
id: nestjs-data-nestjs-exceptions
stack: nestjs
domain: nestjs-data-errors
group: data-access
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

# Errors — NestJS exceptions, not `throw new Error`

Map domain failures to NestJS HTTP exceptions — clients and logs get consistent, classifiable errors.

## Why it matters

- [unclear-failure] Generic 500 in two different cases = inability to distinguish a bug from bad input.
- [unclear-failure] Ad-hoc error shapes per controller — clients and logs cannot classify failures consistently.

## How to fix

Throwing `BadRequestException`, `NotFoundException`, `ForbiddenException` lets NestJS map to the right HTTP status. `throw new Error()` collapses to a generic 500 and hides real failures.

## Incorrect

```typescript
async getSite(id: string) {
  const site = await this.repo.findOne({ where: { id } });
  if (!site) throw new Error('Site not found');     // ← 500
  if (!site.isPublic) throw new Error('Forbidden'); // ← also 500. Same response for two different failures.
  return site;
}
```

## Correct

```typescript
async getSite(id: string, requester: User) {
  const site = await this.repo.findOne({ where: { id } });
  if (!site) throw new NotFoundException(`Site ${id} not found`);
  if (!site.isPublic && site.ownerId !== requester.id) {
    throw new ForbiddenException('Cannot access this site');
  }
  return site;
}
```
