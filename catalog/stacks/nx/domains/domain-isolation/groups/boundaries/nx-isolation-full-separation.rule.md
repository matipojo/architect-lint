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
- Blast radius — a bug in Studio doesn't take down sites-management.
- Clear ownership — every domain has a boundary you can point at.
- Teams work in parallel without trampling each other.

## Issues

- [blast-radius] Dev speed — don't load the whole system to fix one bug.
- [blast-radius] Blast radius — a bug in Studio doesn't take down sites-management.


## How to fix

Every domain is a standalone app: own backend, own frontend, runnable alone. The test: I want to work on sites-management — I bring up that app alone, open the browser, and work. No Studio, no agent builder, nothing else.

## Incorrect

```text
/apps
  angie/                    # one giant app
/libs
  shared/
    components/
    services/
```

## Correct

```text
/apps
  sites-management/
  studio/
  account/
/libs
  sites-management/
    feature-site-list/
    feature-site-create/
    data-access/
    ui/
  studio/
    feature-agent-builder/
    data-access/
    ui/
  shared/
    ui-kit/                 # only truly shared
    util-types/
```
