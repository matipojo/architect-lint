---
id: nx-example-rule-id
stack: nx
domain: domain-isolation
group: boundaries
status: active
since: 2026-05-01
priority: high
tags: [nx]
related: []
replaced_by: null
---

# Short human-readable title

One-line summary shown in listings and Tier 1 review output.

## Why it matters

Platform-level stakes — why this principle exists. Tag each bullet with a stake type.

**Tag dictionary:** see [`issue-type-catalog.md`](./issue-type-catalog.md) (generated from `packages/codegen/issue-type-catalog.ts`).

Quick rules:

- Name the **failure** if ignored — not how the good pattern helps.
- Pick the tag whose **definition** matches; do not default to `agent-gets-lost`.
- `agent-gets-lost` = **coding agents / new teammates** cannot find the correct layer or edit boundary — not prod outages, env config, or LLM product UX.

Allowed tags: `double-charge`, `secret-exposure`, `data-leak`, `abuse-vulnerable`, `data-corruption`, `wastes-money`, `slow-ci`, `hard-to-test`, `unclear-failure`, `agent-gets-lost`, `hard-to-change`, `safe-to-delete`, `hidden-coupling`, `spreads-failure`, `cant-run-alone`, `layer-mixing`, `api-drift`, `breaking-change`, `drops-connection`, `bad-ux`, `cant-scale`, `no-ownership`, `blind-in-prod`, `cant-rollback`.

- [hard-to-test] First bad outcome — what breaks if ignored (not the benefit of following the rule).
- [agent-gets-lost] Second bad outcome — navigation/confusion stake only when boundaries are unclear.

## How to fix

Prescriptive pattern reviewers should enforce.

## Incorrect

```typescript
// bad pattern
```

## Correct

```typescript
// good pattern
```

## When not to apply

Optional — when this rule should not be enforced.
