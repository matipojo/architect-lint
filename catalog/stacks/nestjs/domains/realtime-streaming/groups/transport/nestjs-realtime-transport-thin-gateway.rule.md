---
id: nestjs-realtime-transport-thin-gateway
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

# WebSocket Gateways — thin transport, not business logic

The gateway is transport, not business logic. It receives a message, authorizes, hands off to a service.

## Why it matters

- [hard-to-test] Business logic in the gateway — can't hit it with HTTP tests or reuse it outside WebSockets.
- [hard-to-test] The same service must be reachable over HTTP for debugging and tests, without a socket.

## How to fix

In NestJS, a WebSocket gateway has one responsibility. It does not share state with controllers, and business logic does not live inside it.

## Incorrect

```typescript
@WebSocketGateway()
export class CollaborationGateway {
  private documents = new Map<string, Document>();   // ← state in gateway

  @SubscribeMessage('edit')
  handleEdit(@MessageBody() data: EditMessage) {
    const doc = this.documents.get(data.docId);
    doc.applyEdit(data.edit);
    // no way to test without opening a socket
  }
}
```

## Correct

```typescript
@Injectable()
export class CollaborationService {
  async applyEdit(docId: string, edit: Edit, userId: string): Promise<EditResult> {
    const doc = await this.repo.findById(docId);
    if (!this.policy.canEdit(user, doc)) throw new ForbiddenException();
    return doc.apply(edit);
  }
}

@WebSocketGateway()
export class CollaborationGateway {
  constructor(private collab: CollaborationService) {}

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('edit')
  async handleEdit(@MessageBody() data: EditDto, @ConnectedSocket() client: AuthedSocket) {
    const result = await this.collab.applyEdit(data.docId, data.edit, client.userId);
    this.server.to(data.docId).emit('edit-applied', result);
  }
}
```
