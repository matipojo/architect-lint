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
  - server-to-internal
priority: medium
related:
  - nestjs-testing-generated-client-not-fetch
  - integrations-third-party-dedicated-client-module
---

# Server → internal: cross-domain via exported services, not repos or DB

**Scope: server → internal domain** (server-to-internal). One backend domain calling another inside your monolith — inject the exported service, not HTTP to `/api/...`, not the other domain's repository or tables.

The repository is internal to the domain. The service is the public API.

## Why it matters

- [api-drift] Import another domain's repository — you skip their service and its validation entirely.
- [hidden-coupling] If the workspace domain touches the catalog's repository, a change to the catalog's internal schema breaks the workspace.

## How to fix

If `WorkspaceModule` needs catalog information, it does not inject `CatalogRepository`, hit the DB directly, or `fetch` the catalog API. It injects the `CatalogService` exported by `CatalogModule`. Browser clients use a generated data-access client; external vendors use a dedicated integration client.

## Incorrect

```typescript
// libs/workspace/backend-feature/src/lib/workflows.service.ts
@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Item)
    private catalogRepo: Repository<Item>,    // ← reaching into catalog's repo
  ) {}

  async attachToItem(workflowId: string, itemId: string) {
    const item = await this.catalogRepo.findOne({ where: { id: itemId } });
    // bypasses every CatalogService validation
  }
}
```

## Correct

```typescript
// libs/catalog/backend-feature/src/lib/catalog.service.ts
@Injectable()
export class CatalogService {
  async getItem(id: string): Promise<Item> { /* ... */ }
}

@Module({
  providers: [CatalogService, CatalogRepository],
  exports: [CatalogService],   // ← repository is NOT exported
})
export class CatalogModule {}

// libs/workspace/backend-feature/src/lib/workflows.service.ts
@Injectable()
export class WorkflowsService {
  constructor(private catalog: CatalogService) {}   // through the front door

  async attachToItem(workflowId: string, itemId: string) {
    const item = await this.catalog.getItem(itemId);
    // goes through CatalogService validation, authorization, logging
  }
}
```
