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

Use a Redis adapter so WebSocket and SSE events reach clients on any app instance.

## Why it matters

- [cant-scale] Without it, user A is on instance 1, user B on instance 2 — they don't see each other.
- [cant-scale] Room broadcasts only reach clients on the same process — multi-instance fan-out silently fails.
- [cant-scale] In-memory SSE buffers — resume lands on another node and the stream starts over or 404s.



## How to fix

The moment you have more than one server instance, you can't keep connections in process memory. Redis (or similar) is the broker that fans events between instances. After wiring, `server.to(roomId).emit(...)` reaches every instance and every user in the room.

For **SSE resumable streams**, the same Redis (or similar) broker lets instance B serve a `GET .../stream` resume when instance A handled the original `POST /stream`. That satisfies this rule for cross-instance relay — it does **not** require keeping the LLM alive after disconnect. Relay + abort-on-idle is valid.

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
