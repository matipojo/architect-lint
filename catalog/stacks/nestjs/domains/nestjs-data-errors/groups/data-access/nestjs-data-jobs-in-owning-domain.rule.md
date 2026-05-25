---
id: nestjs-data-jobs-in-owning-domain
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

# Background jobs and events — inside the owning domain

Background jobs enqueue from the domain that owns the work — callers must not know another domain's queue shape.

## Why it matters

- [hidden-coupling] If the workspace domain pushes a job to the catalog domain's queue, it knows the catalog's internal job structure. Hidden coupling.

## How to fix

If a domain needs async work (send an email, fire a webhook, recompute statistics), it defines the job inside its own module. Another domain does not push a job onto domain X's queue.

Cross-domain communication via events — a typed event bus, not a direct call into another module's job.

## Incorrect

```typescript
// libs/workspace/backend-feature/src/lib/workflows.service.ts
@Injectable()
export class WorkflowsService {
  constructor(
    @InjectQueue('catalog-cleanup') private catalogQueue: Queue,   // ← another domain's queue
  ) {}

  async deleteWorkflow(id: string) {
    await this.repo.delete(id);
    await this.catalogQueue.add('rebuild-index', { workflowId: id });   // ← workspace knows catalog internals
  }
}
```

## Correct

```typescript
// libs/shared/backend-events/src/lib/events.ts
export type WorkflowDeletedEvent = {
  type: 'workflow.deleted';
  workflowId: string;
  at: string;
};

// libs/workspace/backend-feature/src/lib/workflows.service.ts
@Injectable()
export class WorkflowsService {
  constructor(private events: EventBus) {}

  async deleteWorkflow(id: string) {
    await this.repo.delete(id);
    await this.events.publish<WorkflowDeletedEvent>({
      type: 'workflow.deleted',
      workflowId: id,
      at: new Date().toISOString(),
    });
  }
}

// libs/catalog/backend-feature/src/lib/workflow-deleted.handler.ts
@EventHandler('workflow.deleted')
export class WorkflowDeletedHandler {
  async handle(event: WorkflowDeletedEvent) {
    // catalog decides what to do, at its own pace
  }
}
```
