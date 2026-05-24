---
id: nx-monorepo-docs-readme-required
stack: nx
domain: monorepo-hygiene
group: documentation
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nx
  - monorepo
  - documentation
priority: high
related: []
---

# Documentation in a place you can't miss

In a platform, a new person doesn't learn "the system" — they learn one domain at a time. The README is the entry point.

## Why it matters

- In a platform, a new person doesn't learn "the system" — they learn one domain at a time. The README is the entry point.
- If you can't write a short clear README, the domain isn't well-defined.

## Issues

- [governance] In a platform, a new person doesn't learn "the system" — they learn one domain at a time. The README is the entry point.
- [governance] If you can't write a short clear README, the domain isn't well-defined.


## How to fix

Every app has a README. Every feature lib has a README. It explains: responsibility, public API, how to run alone, external dependencies.

## Incorrect

```text
/apps/sites-management
  /src
  project.json
  (no README)
```

## Correct

````markdown
# Sites Management

## Responsibility
Sites, projects, organizations, users.

## Run standalone
```bash
pnpm nx serve sites-management
# http://localhost:4201
```

## Libraries
- `libs/sites-management/feature-*` — screens.
- `libs/sites-management/data-access` — public API. **Only this is exported to other domains.**
- `libs/sites-management/ui` — internal components.

## External dependencies
- Postgres
- No dependency on other domains. See `nx graph`.

## Owner
Team X.
````
