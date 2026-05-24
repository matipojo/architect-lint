---
id: nestjs-realtime-transport-sse-vs-websocket
stack: nestjs
domain: realtime-streaming
group: transport
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nestjs
  - sse
  - websocket
  - streaming
priority: high
related: []
---

# Pick one mechanism per flow — don't confuse SSE with WebSocket

WebSocket is operationally more expensive (sticky sessions, scaling, connections that don't close).

## Why it matters

- WebSocket is operationally more expensive (sticky sessions, scaling, connections that don't close).
- For LLM response streaming — SSE wins big: works through HTTP/2, through proxies, with regular infrastructure.

## Issues

- [security] webSocket for one-way LLM streaming adds sticky sessions, socket auth, and reconnect complexity.
- [maintainability] proxies and load balancers treat long-lived sockets differently from plain HTTP/SSE.


## How to fix

- **SSE (Server-Sent Events)** — one-way stream from server to client. Ideal for LLM token streaming, job progress, notifications.
- **WebSocket** — bidirectional. Required only when the client sends frequent unsolicited messages (collaborative editing, user-to-user chat).
- **Long polling** — fallback, not default.

## Incorrect

```typescript
@WebSocketGateway()
export class ChatGateway {
  @SubscribeMessage('prompt')
  async handlePrompt(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    for await (const token of this.llm.stream(data.prompt)) {
      client.emit('token', token);
    }
  }
}
```

## Correct

```typescript
@Controller('chat')
export class ChatController {
  @Post('stream')
  @Sse()
  async stream(@Body() dto: PromptDto): Promise<Observable<MessageEvent>> {
    return new Observable((subscriber) => {
      (async () => {
        for await (const token of this.llm.stream(dto.prompt)) {
          subscriber.next({ data: { token } });
        }
        subscriber.complete();
      })();
    });
  }
}
```
