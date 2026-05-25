---
name: architect-lint-review
description: Run an architecture review against catalog principles with progressive disclosure output. Use when the user invokes /architect-lint-review or asks for an architecture lint review.
---

# architect-lint-review

Review changed code against principles in `catalog/stacks/` (via stack skills).

## Steps

1. Read `.architect-lint.yaml` if present:
   - `stacks`: which stacks to apply (nx / react / nestjs / integrations)
   - `scope`: `changed` | `all` (files to review)
   - `preset`: `recommended` | `baseline` | `strict` | `all`
2. Load `registry/index.json` for rule metadata and permalinks.
3. For each applicable rule, **read** the catalog Principle Record (`.rule.md`).
4. Emit findings using Tier 1 format; add rationale when `--explain` is requested.

## Tier 1 output

```
❌ nestjs-realtime-transport-sse-vs-websocket — Pick one mechanism per flow — don't confuse SSE with WebSocket
   https://matipojo.github.io/architect-lint/rules/nestjs-realtime-transport-sse-vs-websocket
   File: src/chat.gateway.ts:12
   Problem: WebSocket used for one-way LLM stream
   Fix: Use SSE for server→client streaming
```

## Tier 2 (`--explain`)

Add the **How to fix** section from the rule.

## Tier 3

User opens the permalink for full examples and related principles.
