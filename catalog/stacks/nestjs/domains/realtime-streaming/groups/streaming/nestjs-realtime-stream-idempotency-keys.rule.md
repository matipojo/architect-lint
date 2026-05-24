---
id: nestjs-realtime-stream-idempotency-keys
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

# Idempotency keys on every agent action

Unreliable networks + client retries = duplicate runs of the same prompt = double charges.

## Why it matters

- Unreliable networks + client retries = duplicate runs of the same prompt = double charges.
- This is the industry standard (Stripe). For expensive agent runs — mandatory.

## Issues

- [data-integrity] Without this: client retries create duplicate agent runs — double charges on expensive LLM calls.
- [ux] Without this: double-clicks spawn two runs for the same user intent.
- [data-integrity] Without this: unreliable networks + client retries = duplicate runs of the same prompt = double charges.
- [performance] Without this: this is the industry standard (Stripe). For expensive agent runs — mandatory.

## How to fix

The client sends an `Idempotency-Key` header on every run-creation request. If the request arrives twice (network, retry, double-click) — the server returns the same run, doesn't create a new one.

## Incorrect

```typescript
@Post('runs')
async startRun(@Body() dto: StartRunDto, @CurrentUser() user: User) {
  const run = await this.runs.create({ userId: user.id, prompt: dto.prompt });
  return { runId: run.id };
}
```

## Correct

```typescript
@Post('runs')
async startRun(
  @Body() dto: StartRunDto,
  @Headers('idempotency-key') idempotencyKey: string,
  @CurrentUser() user: User,
) {
  if (!idempotencyKey) throw new BadRequestException('Idempotency-Key header required');

  const existing = await this.runs.findByIdempotencyKey(user.id, idempotencyKey);
  if (existing) return { runId: existing.id, deduplicated: true };

  const run = await this.runs.create({ userId: user.id, prompt: dto.prompt, idempotencyKey });
  return { runId: run.id };
}
```
