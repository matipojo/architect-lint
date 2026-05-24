---
name: architect-lint
description: Route architecture reviews to stack-specific architect-lint skills (Nx, React, NestJS). Use when reviewing code against professional architecture principles, running /architect-lint-review, or when the user asks about architecture standards.
---

# architect-lint

Orchestrator for stack-specific architecture principle skills. Each skill references `catalog/stacks/**/*.rule.md` — the single source of truth.

## Stack skills

| Stack | Skill | Rules |
| --- | --- | --- |
| Nx | `architect-lint-nx` | 14 |
| React | `architect-lint-react` | 4 |
| NestJS | `architect-lint-nestjs` | 32 |

## Workflow

1. Read `.architect-lint.yaml` in the consumer repo (if present) to select stacks and review scope.
2. Pick the narrowest stack skill for the change (nx / react / nestjs).
3. **Read** each referenced `*.rule.md` file before citing a violation.
4. Output findings with permalinks to `https://matipojo.github.io/architect-lint/rules/{stack}/{domain}/{rule-id}`.

## Review command

Use `/architect-lint-review` for progressive disclosure (Tier 1 → Tier 2 → permalink).
