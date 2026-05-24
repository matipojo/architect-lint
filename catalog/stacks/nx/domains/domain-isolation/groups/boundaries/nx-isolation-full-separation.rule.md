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

Dev speed — don't load the whole system to fix one bug.

## Why it matters

- Dev speed — don't load the whole system to fix one bug.
- Blast radius — a bug in the workspace domain doesn't take down catalog.
- Clear ownership — every domain has a boundary you can point at.
- Teams work in parallel without trampling each other.


## How to fix

Every domain is a standalone app: own backend, own frontend, runnable alone. The test: I want to work on catalog — I bring up that app alone, open the browser, and work. No workspace, no workflow builder, nothing else.

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
