---
id: nestjs-resilience-migrations-in-domain
stack: nestjs
domain: runtime-resilience
group: resilience
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nestjs
  - database
  - migrations
priority: medium
related: []
---

# Migrations are part of the domain

Each domain owns its database migrations — no cross-domain schema edits.

## Why it matters

- [hard-to-change] A migration that needs two-team coordination = a feature that slips by a month.
- [hidden-coupling] The moment a domain edits another's tables, separation is in code only — not in the DB.

## How to fix

A DB migration lives in the domain's `data-access` lib. One domain doesn't touch another's tables. A schema change = a PR inside that domain, not in infrastructure.

Foreign-key direction matters: the **consumer** holds the link to the **owner**, not the other way around. If workspace needs to link a workflow to a catalog item, the FK lives on `workflows.item_id` — not on the catalog table.

## Incorrect

```sql
-- migrations/2026_05_add_workflow_to_items.sql (where does it live? who owns it?)
ALTER TABLE items ADD COLUMN active_workflow_id UUID REFERENCES workflows(id);
-- now catalog knows about workflows. The workspace domain injected a column into catalog.
```

## Correct

```sql
-- libs/catalog/data-access/migrations/2026_05_add_slug_index.sql
-- Changes to the `items` table live in the catalog domain.
CREATE INDEX CONCURRENTLY items_slug_idx ON items (slug);

-- libs/workspace/data-access/migrations/2026_05_add_item_link.sql
-- The consumer (workspace) holds the link in its own table.
ALTER TABLE workflows ADD COLUMN item_id UUID REFERENCES items(id);
CREATE INDEX workflows_item_id_idx ON workflows (item_id);
```
