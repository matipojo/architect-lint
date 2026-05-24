---
id: nestjs-realtime-stream-agent-runs-as-resource
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
priority: high
related:
  - nestjs-realtime-stream-llm-cancellation-backpressure
  - nestjs-realtime-transport-redis-adapter-scaling
---

# Agent runs are a resource, not an ephemeral stream

The user closes the tab mid-response and re-opens — you need to show where it stopped.

## Why it matters

- [bad-ux] Stream-only output — close the tab and the partial response is gone forever.
- [bad-ux] Nothing persisted per run — can't audit LLM spend or debug what the user actually saw.
- [bad-ux] Run state only in browser memory — phone and laptop show different partial streams.
- [data-corruption] streaming straight to the client, nothing persisted except the final message



## How to fix

An agent run (the text streaming to the user) is a resource with an ID — not just a passing stream. It is persisted in the DB with state (`pending`, `running`, `completed`, `failed`, `canceled`), accumulated output, and tool calls.

## Incorrect

```typescript
@Sse('chat')
async chat(@Body() dto: PromptDto) {
  // streaming straight to the client, nothing persisted except the final message
}
```

## Correct

```typescript
@Post('runs')
async startRun(@Body() dto: StartRunDto, @CurrentUser() user: User): Promise<{ runId: string }> {
  const run = await this.runs.create({ userId: user.id, prompt: dto.prompt });
  this.queue.add('execute-run', { runId: run.id });
  return { runId: run.id };
}

@Sse('runs/:id/events')
streamRun(@Param('id') runId: string, @CurrentUser() user: User): Observable<MessageEvent> {
  return this.runs.subscribeToEvents(runId, user);
  // can also replay events that already happened, if the user joined late
}

@Get('runs/:id')
async getRun(@Param('id') runId: string, @CurrentUser() user: User): Promise<RunDto> {
  return this.runs.getForUser(runId, user);
}

@Post('runs/:id/cancel')
async cancel(@Param('id') runId: string, @CurrentUser() user: User) {
  await this.runs.cancel(runId, user);
}
```
