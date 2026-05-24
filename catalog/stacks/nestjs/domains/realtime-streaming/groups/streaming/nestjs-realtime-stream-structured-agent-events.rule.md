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
related: []
---

# Tool calls and agent output — structured events, not free text

Free-text streams can't drive UI state for tool calls, errors, or completion.

## Why it matters

- The UI needs to know when to show a "searching the site" spinner, when to show the result, when to show an error. From free text — impossible.
- Typed events feed logging, analytics, and debugging — from the same stream.

## Issues

- [ux] Without this: uI can't show tool-call spinners or error states from a plain text stream.
- [maintainability] Without this: logging and analytics can't parse unstructured token output.
- [ux] Without this: the UI needs to know when to show a "searching the site" spinner, when to show the result, when to show an error. From free text — impossible.
- [maintainability] Without this: typed events feed logging, analytics, and debugging — from the same stream.

## How to fix

An agent's response streams as a sequence of typed events: `text-delta`, `tool-call-started`, `tool-call-completed`, `tool-call-failed`, `run-completed`. Not free text the client has to parse.

## Incorrect

```typescript
sse.addEventListener('message', (e) => {
  appendText(e.data);
});
```

## Correct

```typescript
// libs/studio/data-access/src/lib/run-events.ts
export type RunEvent =
  | { type: 'text-delta';          delta: string }
  | { type: 'tool-call-started';   toolCallId: string; tool: string; args: unknown }
  | { type: 'tool-call-completed'; toolCallId: string; result: unknown }
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
