---
id: nestjs-realtime-transport-namespaced-rooms
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

# Rooms and channels — always namespaced by domain and tenant

Without namespacing, a name collision between orgs = a user receives another org's events. Data leak.

## Why it matters

- Without namespacing, a name collision between orgs = a user receives another org's events. Data leak.
- Same problem as multi-tenancy in the DB, but on the real-time channel.

## Issues

- [maintainability] Without this: same problem as multi-tenancy in the DB, but on the real-time channel.
- [security] Without this: failure mode: without namespacing, a name collision between orgs = a user receives another org's events. Data leak.
- [security] Failure mode: without namespacing, a name collision between orgs = a user receives another org's events. Data leak.

## How to fix

A room in `socket.io` or a topic in a message broker must include the tenant. `room: doc-123` is wrong. `room: org-456:doc-123` is right.

## Incorrect

```typescript
client.join(`doc-${docId}`);
this.server.to(`doc-${docId}`).emit('update', data);
```

## Correct

```typescript
// libs/shared/backend-realtime/src/lib/rooms.ts
export function docRoom(orgId: string, docId: string) {
  return `org:${orgId}:doc:${docId}`;
}

client.join(docRoom(user.orgId, docId));
this.server.to(docRoom(user.orgId, docId)).emit('update', data);
```
