---
id: nx-isolation-deps-no-global-state
stack: nx
domain: domain-isolation
group: dependencies
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nx
  - monorepo
  - domain-driven-design
priority: high
related: []
---

# No shared global state

Global state is the fastest way to destroy a platform — untraceable dependencies.

## Why it matters

- Global state is the fastest way to destroy a platform — untraceable dependencies.
- Without this, "run the app standalone" becomes an illusion — it waits for someone to populate state.

## Issues

- [coupling] Without this: global state is the fastest way to destroy a platform — untraceable dependencies.
- [blast-radius] Without this: failure mode: without this, "run the app standalone" becomes an illusion — it waits for someone to populate state.
- [blast-radius] Failure mode: without this, "run the app standalone" becomes an illusion — it waits for someone to populate state.

## How to fix

No singletons holding cross-domain state. No global store every app writes to. If two domains need the same data, one owns it and the other receives it via the public contract.

## Incorrect

```typescript
// libs/shared/state/src/lib/global-store.ts
export const globalStore = {
  currentUser: null,
  currentSite: null,
  activeAgent: null,
  isTestMode: false,
};
```

## Correct

```typescript
// libs/studio/feature-agent-builder/src/lib/agent-runner.ts
type RunAgentOptions = { agent: Agent; testMode: boolean };

export function runAgent({ agent, testMode }: RunAgentOptions) {
  if (testMode) { /* ... */ }
  return agent.run();
}

// apps/studio/src/main.tsx — composing layer
const user = await usersApi.getCurrent();
const site = await sitesApi.get(siteId);
runAgent({ agent: site.agent, testMode: user.preferences.testMode });
```
