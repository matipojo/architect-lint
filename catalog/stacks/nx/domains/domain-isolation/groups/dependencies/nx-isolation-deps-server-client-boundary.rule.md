---
id: nx-isolation-deps-server-client-boundary
stack: nx
domain: domain-isolation
group: dependencies
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nx
  - monorepo
  - domain-driven-design
priority: high
related: []
---

# Clear server vs client boundary

Server code leaking to client = bloated bundle, or worse, secret leak.

## Why it matters

- Server code leaking to client = bloated bundle, or worse, secret leak.
- Client code leaking to server = runtime errors on `window`.

## Issues

- [security] Server code leaking to client = bloated bundle, or worse, secret leak.
- [security] Client code leaking to server = runtime errors on `window`.


## How to fix

In a monorepo with backend and frontend apps, every library must declare which side it runs on. A "both" library is one the bundler will catch importing `fs` in production. Tag libs `scope:server`, `scope:client`, or `scope:isomorphic` and enforce via `enforce-module-boundaries`.

## Incorrect

```typescript
// libs/shared/utils/src/lib/index.ts
export { formatDate } from './format-date';      // browser-safe
export { signJWT }    from './sign-jwt';         // server-only, uses crypto
export { parseCSV }   from './parse-csv';        // browser-safe
```

## Correct

```text
/libs/shared
  /util-formatting    [scope:isomorphic]    # both sides
  /util-server        [scope:server]        # backend only
  /util-browser       [scope:client]        # frontend only
```
