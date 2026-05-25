---
id: nestjs-module-domain-standalone
stack: nestjs
domain: nestjs-modules
group: module-structure
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nestjs
  - modules
  - openapi
priority: medium
related: []
---

# Every domain is a standalone NestJS Module

Domain logic trapped in AppModule — libs stay empty shells.

## Why it matters

- [cant-run-alone] Domain code lives only in AppModule — libs are empty and the domain can't load elsewhere.
- [agent-gets-lost] Without this, all controllers and services live in the app and the libs are empty — and rule 1 (domain separation) becomes decoration.


## How to fix

In Nx + NestJS, a domain becomes a `Module` that lives in `libs/<domain>/backend-feature-*` (or similar). The backend `app` only assembles those modules in `AppModule`.

## Incorrect

```typescript
// apps/api/src/app.module.ts
@Module({
  controllers: [SitesController, AgentsController, UsersController, BillingController],
  providers: [SitesService, AgentsService, UsersService, BillingService, PrismaService],
})
export class AppModule {}
```

## Correct

```typescript
// libs/sites-management/backend-feature/src/lib/sites.module.ts
@Module({
  imports: [SitesDataAccessModule],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],          // ← only what's public
})
export class SitesModule {}

// libs/studio/backend-feature/src/lib/studio.module.ts
@Module({
  imports: [StudioDataAccessModule],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class StudioModule {}

// apps/api/src/app.module.ts
@Module({
  imports: [SitesModule, StudioModule, AccountModule],
})
export class AppModule {}
```
