---
id: nestjs-resilience-observability-infrastructure
stack: nestjs
domain: runtime-resilience
group: resilience
status: active
replaced_by: null
since: 2026-05-01
tags:
  - react
  - observability
  - migrations
priority: medium
related: []
---

# Observability is infrastructure, not an add-on

When something breaks, the first question is "which domain?" If the logs don't know — you're blind.

## Why it matters

- When something breaks, the first question is "which domain?" If the logs don't know — you're blind.
- Without a standard, you end up with five log formats and can't search anything.

## Issues

- [maintainability] When something breaks, the first question is "which domain?" If the logs don't know — you're blind.
- [maintainability] Without a standard, you end up with five log formats and can't search anything.


## How to fix

Logs, metrics, and traces come out of one shared platform library. Every domain uses it — does not roll its own. Every log carries `domain` and `requestId` by default.

## Incorrect

```typescript
// in one domain
console.log('site created', siteId);

// in another
logger.info({ event: 'agent_started', agent_id: agentId });

// in a third
console.log(`[STUDIO] running agent ${name} at ${new Date()}`);
```

## Correct

```typescript
// libs/shared/observability/src/lib/logger.ts
export function createLogger(domain: string) {
  return baseLogger.child({ domain });
}

// in a domain
import { createLogger } from '@angie/shared/observability';
const log = createLogger('sites-management');

log.info({ event: 'site.created', siteId });
```
