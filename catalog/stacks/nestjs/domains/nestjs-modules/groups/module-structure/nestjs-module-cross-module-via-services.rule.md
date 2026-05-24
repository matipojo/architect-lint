---
id: nestjs-module-cross-module-via-services
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

# Cross-module communication via exported services, not repositories or DB

The repository is internal to the domain. The service is the public API.

## Why it matters

- The repository is internal to the domain. The service is the public API.
- If Studio touches Sites' repository, a change to Sites' internal schema breaks Studio.
- The service is where validation, authorization, and logging are enforced.

## Issues

- [coupling] Without this: bypasses every SitesService validation
- [contract] Without this: the repository is internal to the domain. The service is the public API.
- [security] Without this: the service is where validation, authorization, and logging are enforced.
- [data-integrity] Without this: failure mode: if Studio touches Sites' repository, a change to Sites' internal schema breaks Studio.
- [data-integrity] Failure mode: if Studio touches Sites' repository, a change to Sites' internal schema breaks Studio.

## How to fix

If `StudioModule` needs site information, it does not inject `SitesRepository` or hit the DB directly. It injects the `SitesService` exported by `SitesModule`.

## Incorrect

```typescript
// libs/studio/backend-feature/src/lib/agents.service.ts
@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Site)
    private sitesRepo: Repository<Site>,    // ← reaching into Sites' repo
  ) {}

  async attachToSite(agentId: string, siteId: string) {
    const site = await this.sitesRepo.findOne({ where: { id: siteId } });
    // bypasses every SitesService validation
  }
}
```

## Correct

```typescript
// libs/sites-management/backend-feature/src/lib/sites.service.ts
@Injectable()
export class SitesService {
  async getSite(id: string): Promise<Site> { /* ... */ }
}

@Module({
  providers: [SitesService, SitesRepository],
  exports: [SitesService],   // ← repository is NOT exported
})
export class SitesModule {}

// libs/studio/backend-feature/src/lib/agents.service.ts
@Injectable()
export class AgentsService {
  constructor(private sites: SitesService) {}   // through the front door

  async attachToSite(agentId: string, siteId: string) {
    const site = await this.sites.getSite(siteId);
    // goes through SitesService validation, authorization, logging
  }
}
```
