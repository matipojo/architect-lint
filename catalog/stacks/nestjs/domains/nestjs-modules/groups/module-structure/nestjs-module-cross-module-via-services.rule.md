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

- [api-drift] Import another domain's repository — you skip their service and its validation entirely.
- [hidden-coupling] If the workspace domain touches the catalog's repository, a change to the catalog's internal schema breaks the workspace.

## How to fix

If `WorkspaceModule` needs catalog information, it does not inject `CatalogRepository` or hit the DB directly. It injects the `CatalogService` exported by `CatalogModule`.

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
