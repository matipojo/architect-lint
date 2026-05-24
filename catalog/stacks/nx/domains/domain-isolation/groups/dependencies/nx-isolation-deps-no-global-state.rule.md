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

- [hidden-coupling] Global state is the fastest way to destroy a platform — untraceable dependencies.
- [cant-run-alone] Without this, "run the app standalone" becomes an illusion — it waits for someone to populate state.


## How to fix

No singletons holding cross-domain state. No global store every app writes to. If two domains need the same data, one owns it and the other receives it via the public contract.

## Incorrect

```typescript
// libs/shared/state/src/lib/global-store.ts
export const globalStore = {
  currentUser: null,
  currentSite: null,
  activeWorkflow: null,
  isDevMode: false,
};
```

## Correct

```typescript
// libs/workspace/feature-workflow-builder/src/lib/workflow-runner.ts
type RunWorkflowOptions = { workflow: Workflow; devMode: boolean };

export function runWorkflow({ workflow, devMode }: RunWorkflowOptions) {
  if (devMode) { /* ... */ }
  return workflow.run();
}

// apps/workspace/src/main.tsx — composing layer
const user = await usersApi.getCurrent();
const site = await sitesApi.get(siteId);
runWorkflow({ workflow: site.workflow, devMode: user.preferences.devMode });
```
