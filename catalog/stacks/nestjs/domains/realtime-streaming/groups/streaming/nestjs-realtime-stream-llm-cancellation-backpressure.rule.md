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

Without cancellation, you pay for a response no one reads. At scale this is real money.

## Why it matters

- [wastes-money] Without cancellation, you pay for a response no one reads. At scale this is real money.
- [wastes-money] Without backpressure, the server accumulates unsent responses and explodes on memory.
- [wastes-money] When the client disconnected — downstream work keeps running

## How to fix

The user closes the tab mid-response? The upstream LLM call must abort. The server stops paying.
The LLM emits faster than the client can consume? Push backpressure.

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
