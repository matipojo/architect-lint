---
id: nestjs-realtime-stream-heartbeats-reconnect
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

# Heartbeats and reconnect — part of the protocol, not an add-on

Heartbeats and reconnect belong in the transport protocol from day one — not as a later patch.

## Why it matters

- Proxies and load balancers close idle connections after ~60 seconds. Without heartbeats, the client thinks it's connected but isn't.
- LLM streaming has long pauses between tokens (tool calls). Heartbeats keep the connection alive.

## Issues

- [reliability] Silent disconnects — UI shows "streaming" while the connection is already dead.
- [performance] Without this: long tool-call pauses trigger proxy timeouts without keep-alive traffic.
- [ux] Without this: resume after refresh fails when the server never emitted event IDs for `Last-Event-Id`.
- [ux] Without this: proxies and load balancers close idle connections after ~60 seconds. Without heartbeats, the client thinks it's connected but isn't.
- [maintainability] Without this: lLM streaming has long pauses between tokens (tool calls). Heartbeats keep the connection alive.

## How to fix

- **SSE**: emit an empty comment (`:heartbeat\n\n`) every 15–30 seconds; on reconnect the client sends `Last-Event-Id` to resume.
- **WebSocket**: rely on ping/pong (socket.io does this automatically) and exponential backoff on reconnect.
- For durable runs, pair heartbeats with explicit cancel/resume policy (see related streaming rules).

## Incorrect

```typescript
@Sse('runs/:id/events')
streamRun(@Param('id') runId: string): Observable<MessageEvent> {
  return this.runs.events(runId);
}
```

## Correct

```typescript
@Sse('runs/:id/events')
streamRun(@Param('id') runId: string): Observable<MessageEvent> {
  return merge(
    this.runs.events(runId),
    interval(15_000).pipe(map(() => ({ type: 'heartbeat', data: '' } as MessageEvent))),
  );
}

// frontend
const sse = new EventSource(`/runs/${runId}/events`);
// EventSource auto-reconnects with Last-Event-Id when the server emits `id:` on every event
```
