---
id: nestjs-realtime-stream-llm-cancellation-backpressure
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
  - nestjs-realtime-transport-redis-adapter-scaling
  - nestjs-realtime-stream-agent-runs-as-resource
---

# LLM streaming — cancellation and backpressure are mandatory

Cancel downstream LLM work when the client disconnects and apply backpressure when it cannot keep up.

## Why it matters

- [wastes-money] Without cancellation, you pay for a response no one reads. At scale this is real money.
- [wastes-money] Without backpressure, the server accumulates unsent responses and explodes on memory.
- [wastes-money] Client disconnected but downstream LLM work keeps running — pure waste.

## How to fix

The user closes the tab mid-response? The upstream LLM call must abort. The server stops paying.
The LLM emits faster than the client can consume? Push backpressure.

**Cancellation mode depends on run durability.** The example below applies to **ephemeral streams** — no durable run, no Redis resume. When the run is durable/resumable (see related rules), HTTP disconnect is not always abandonment, and `req.on('close')` → abort breaks page-refresh resume.

| Mode | When | Cancel on HTTP disconnect? |
| --- | --- | --- |
| **Ephemeral** | One-shot SSE, no resume | Yes — `req.on('close')` → abort |
| **Durable / resumable** | Run persisted, Redis buffer, `GET .../stream` resume | Ask the user — product trade-off, not a fixed default |
| **Cost guard** | Durable + idle timeout | Abort if no consumer reconnects within N minutes |
| **Explicit only** | Host opts into cost-first | Only `DELETE` / Stop aborts |

Page refresh and tab close look **identical** to the server (TCP drop). Backpressure (propagating consumer slowness to the LLM stream) applies in **both** modes regardless of the chosen cancel policy.

## Incorrect

```typescript
async streamPrompt(prompt: string, res: Response) {
  const stream = await this.llmClient.streamCompletion({
    model: 'default-model', messages: [{ role: 'user', content: prompt }], stream: true,
  });
  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    // what if the client disconnected?
  }
}
```

## Correct

```typescript
@Sse('stream')
stream(@Body() dto: PromptDto, @Req() req: Request): Observable<MessageEvent> {
  const abortController = new AbortController();
  req.on('close', () => abortController.abort());

  return new Observable((subscriber) => {
    (async () => {
      try {
        const stream = await this.llmClient.streamCompletion({
          model: 'default-model',
          messages: [{ role: 'user', content: dto.prompt }],
          stream: true,
        }, { signal: abortController.signal });

        for await (const chunk of stream) {
          if (abortController.signal.aborted) break;
          subscriber.next({ data: chunk });
        }
        subscriber.complete();
      } catch (err) {
        if (!abortController.signal.aborted) subscriber.error(err);
      }
    })();

    return () => abortController.abort();
  });
}
```
