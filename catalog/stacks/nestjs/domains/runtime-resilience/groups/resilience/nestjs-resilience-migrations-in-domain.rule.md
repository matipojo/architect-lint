---
id: nestjs-resilience-migrations-in-domain
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

# Migrations are part of the domain

A migration that needs two-team coordination = a feature that slips by a month.

## Why it matters

- A migration that needs two-team coordination = a feature that slips by a month.
- The moment a domain edits another's tables, separation is in code only — not in the DB.

## Issues

- [maintainability] Without this: a migration that needs two-team coordination = a feature that slips by a month.
- [maintainability] Without this: the moment a domain edits another's tables, separation is in code only — not in the DB.

## How to fix

A DB migration lives in the domain's `data-access` lib. One domain doesn't touch another's tables. A schema change = a PR inside that domain, not in infrastructure.

## Incorrect

```sql
-- migrations/2026_05_add_agent_to_sites.sql (where does it live? who owns it?)
ALTER TABLE sites ADD COLUMN active_agent_id UUID REFERENCES agents(id);
-- now sites knows about agents. The Studio domain injected a column into Sites.
```

## Correct

```sql
-- libs/sites-management/data-access/migrations/2026_05_add_slug_index.sql
CREATE INDEX CONCURRENTLY sites_slug_idx ON sites (slug);
```
