---
id: nestjs-realtime-stream-structured-agent-events
stack: nestjs
domain: realtime-streaming
group: streaming
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nestjs
  - sse
  - websocket
  - streaming
priority: medium
related:
  - nestjs-realtime-stream-tool-output-schema-required
---

# Tool calls and agent output — structured events, not free text

Free-text streams can't drive UI state for tool calls, errors, or completion.

## Why it matters

- [bad-ux] The UI needs to know when to show a "searching the site" spinner, when to show the result, when to show an error. From free text — impossible.
- [blind-in-prod] Unstructured token stream — logs and analytics can't tell tool calls from text deltas.

## How to fix

An agent's response streams as a sequence of typed events: `text-delta`, `tool-call-started`, `tool-call-completed`, `tool-call-failed`, `run-completed`. Not free text the client has to parse.

Project AI response stream events into this contract — do not persist or forward raw provider message payloads. Tool `result` fields must come from schema-validated tool output (see the related tool-output rule).

## Incorrect

```typescript
sse.addEventListener('message', (e) => {
  appendText(e.data);
});
```

## Correct

```typescript
// libs/workspace/data-access/src/lib/run-events.ts
export type RunEvent =
  | { type: 'text-delta';          delta: string }
  | { type: 'tool-call-started';   toolCallId: string; tool: string; args: unknown }
  | { type: 'tool-call-completed'; toolCallId: string; result: SearchSiteOutput /* per-tool outputSchema */ }
  | { type: 'tool-call-failed';    toolCallId: string; error: string }
  | { type: 'run-completed';       runId: string; tokensUsed: number }
  | { type: 'run-failed';          runId: string; error: string };

// frontend
sse.addEventListener('message', (e) => {
  const event = JSON.parse(e.data) as RunEvent;
  switch (event.type) {
    case 'text-delta':         appendText(event.delta); break;
    case 'tool-call-started':  showToolSpinner(event.tool); break;
    case 'tool-call-completed': showToolResult(event.toolCallId, event.result); break;
    // ...
  }
});
```
