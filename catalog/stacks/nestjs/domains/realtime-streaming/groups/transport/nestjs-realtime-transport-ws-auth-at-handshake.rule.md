---
id: nestjs-realtime-transport-ws-auth-at-handshake
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
related: []
---

# WebSocket auth — at handshake, not per message

Authenticate WebSocket connections at handshake — not with JWT verification on every message.

## Why it matters

- [wastes-money] Authenticating per message = JWT verify on every keystroke. Expensive at chat scale.
- [drops-connection] Unauthenticated sockets stay open until the first message — resource leak.



## How to fix

On `connect`, the client sends a token (in `socket.io` `auth`, in a query, or in `Sec-WebSocket-Protocol`). If invalid → immediate disconnect. Each subsequent message reads the user from the socket context.

## Incorrect

```typescript
@SubscribeMessage('chat')
async onMessage(@MessageBody() body: string, @ConnectedSocket() client: Socket) {
  const user = await this.jwt.verify(client.handshake.auth.token);
  return { from: user.id, body };
}
```

## Correct

```typescript
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection {
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const user = await this.jwt.verify(token);
      (client as AuthedSocket).user = user;
    } catch {
      client.disconnect();
    }
  }
}

@Injectable()
export class WsAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const client = ctx.switchToWs().getClient<AuthedSocket>();
    return !!client.user;
  }
}
```
