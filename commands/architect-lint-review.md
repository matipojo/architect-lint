# architect-lint-review

Run an architecture review against the catalog principles with progressive disclosure output.

## Usage

```
/architect-lint-review
/architect-lint-review --explain
```

## Behavior

1. Read `.architect-lint.yaml` in the consumer repo (if present) to select stacks and review scope.
2. Load `registry/index.json` for rule metadata and permalinks.
3. For each applicable rule, **read** the catalog YAML file — never use cached skill content.
4. Emit Tier 1 findings (rule id, title, file, problem, permalink).
5. With `--explain`, add the `rationale` field from YAML.

## Output format

```
❌ nestjs-realtime-transport-sse-vs-websocket — Pick one mechanism per flow — don't confuse SSE with WebSocket
   https://matipojo.github.io/architect-lint/rules/nestjs-realtime-transport-sse-vs-websocket
   File: src/chat.gateway.ts:12
   Problem: WebSocket used for one-way LLM stream
   Fix: Use SSE for server→client streaming
```

See `skills/architect-lint-review/SKILL.md` for full instructions.
