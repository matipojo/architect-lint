---
id: nestjs-realtime-transport-redis-adapter-scaling
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
priority: medium
related:
  - nestjs-realtime-stream-llm-cancellation-backpressure
  - nestjs-realtime-stream-agent-runs-as-resource
---

# Scaling real-time — via Redis adapter, not in-memory

Without it, user A is on instance 1, user B on instance 2 — they don't see each other.

## Why it matters

- Without it, user A is on instance 1, user B on instance 2 — they don't see each other.
- Every real-time system going to production needs this on day one, or it will hurt later.
- SSE resume across instances also needs a shared broker — in-memory streams can't hand off to another node.

## Issues

- [maintainability] room broadcasts only reach clients on the same process.
- [maintainability] sSE stream resume fails when the resume lands on a different instance than the original POST.


## How to fix

The moment you have more than one server instance, you can't keep connections in process memory. Redis (or similar) is the broker that fans events between instances.

## Incorrect

```typescript
const ioAdapter = new IoAdapter(app);
app.useWebSocketAdapter(ioAdapter);
```

## Correct

```typescript
// apps/api/src/main.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

const app = await NestFactory.create(AppModule);
const pubClient = new Redis(config.REDIS_URL);
const subClient = pubClient.duplicate();

const ioAdapter = new IoAdapter(app);
(ioAdapter as any).createIOServer = (port: number, options: any) => {
  const server = new Server(port, options);
  server.adapter(createAdapter(pubClient, subClient));
  return server;
};
app.useWebSocketAdapter(ioAdapter);
```
