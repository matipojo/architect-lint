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

If Studio pushes a job to Sites' queue, Studio knows Sites' internal job structure. Hidden coupling.

## Why it matters

- If Studio pushes a job to Sites' queue, Studio knows Sites' internal job structure. Hidden coupling.
- Events are how domains coordinate without one knowing the other's internals.

## Issues

- [coupling] If Studio pushes a job to Sites' queue, Studio knows Sites' internal job structure. Hidden coupling.
- [maintainability] Events are how domains coordinate without one knowing the other's internals.


## How to fix

If a domain needs async work (send an email, fire a webhook, recompute statistics), it defines the job inside its own module. Another domain does not push a job onto domain X's queue.

Cross-domain communication via events — a typed event bus, not a direct call into another module's job.

## Incorrect

```typescript
// libs/studio/backend-feature/src/lib/agents.service.ts
@Injectable()
export class AgentsService {
  constructor(
    @InjectQueue('sites-cleanup') private sitesQueue: Queue,   // ← another domain's queue
  ) {}

  async deleteAgent(id: string) {
    await this.repo.delete(id);
    await this.sitesQueue.add('rebuild-index', { agentId: id });   // ← Studio knows Sites internals
  }
}
```

## Correct

```typescript
// libs/shared/backend-events/src/lib/events.ts
export type AgentDeletedEvent = {
  type: 'agent.deleted';
  agentId: string;
  at: string;
};

// libs/studio/backend-feature/src/lib/agents.service.ts
@Injectable()
export class AgentsService {
  constructor(private events: EventBus) {}

  async deleteAgent(id: string) {
    await this.repo.delete(id);
    await this.events.publish<AgentDeletedEvent>({
      type: 'agent.deleted',
      agentId: id,
      at: new Date().toISOString(),
    });
  }
}

// libs/sites-management/backend-feature/src/lib/agent-deleted.handler.ts
@EventHandler('agent.deleted')
export class AgentDeletedHandler {
  async handle(event: AgentDeletedEvent) {
    // Sites decides what to do, at its own pace
  }
}
```
