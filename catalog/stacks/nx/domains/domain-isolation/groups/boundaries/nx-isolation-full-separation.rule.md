---
id: nx-isolation-full-separation
stack: nx
domain: domain-isolation
group: boundaries
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

# Full separation between domains

Every domain is a standalone app with its own backend, frontend, and tests — runnable alone, with no cross-domain shell.

## Why it matters

- [spreads-failure] Fix one domain bug — boot every app and lib because nothing is isolated.
- [spreads-failure] Workspace widget throws — catalog screen goes blank because everything shares one shell.
- [blind-in-prod] Failure spans domains — no boundary to assign, two teams ping-pong the incident.
- [hard-to-change] Shared libs become merge bottlenecks — every feature waits on the same conflict queue.

## How to fix

Every domain is a standalone app: own backend, own frontend, runnable alone. The test: I want to work on catalog — I bring up that app alone, open the browser, and work. No workspace, no workflow builder, nothing else.

Verification: `nx serve catalog` runs with zero connection to workspace. `nx graph` shows islands, not a pile.

## Incorrect

```text
/apps
  monolith/                 # one giant app
/libs
  shared/
    components/
    services/
```

## Correct

```text
/apps
  catalog/
  workspace/
  account/
/libs
  catalog/
    feature-item-list/
    feature-item-create/
    data-access/
    ui/
  workspace/
    feature-workflow-builder/
    data-access/
    ui/
  shared/
    ui-kit/                 # only truly shared
    util-types/
```
