---
id: integrations-third-party-response-schema-required
stack: integrations
domain: third-party-apis
group: response-contracts
status: active
replaced_by: null
since: 2026-05-25
tags:
  - integrations
  - api
priority: high
related:
  - integrations-third-party-dedicated-client-module
---

# External API responses use schema allowlists, not blocklist sanitization

Declare a response schema per integration and parse at the client boundary — never strip unknown fields with a deny list.

## Why it matters

- [data-leak] Blocklists miss new vendor fields — internal metadata from the provider leaks into your DB and API payloads.
- [unclear-failure] Vendor adds a field; the deny list silently fails until production exposes it.
- [api-drift] Raw response blobs stored or forwarded — downstream code cannot rely on a stable contract.

## How to fix

Each client exports a `ResponseSchema` (Zod or JSON Schema) per operation. Parse at the boundary: `ResponseSchema.parse(raw)`. Persist and return only validated objects. No `INTERNAL_KEYS`, no destructuring `{ vendorMeta, ...safe }`. Code blocks below are illustrative, not prescriptive.

## Incorrect

```typescript
const INTERNAL_KEYS = ['_links', '_meta', 'providerTraceId'];
export function sanitizeVendorPayload(raw: unknown) {
  return stripKeys(raw, INTERNAL_KEYS);
}
await repo.save({ payload: vendorResponse });
```

## Correct

```typescript
export const ChargeSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string().length(3),
});

async getCharge(id: string): Promise<Charge> {
  const raw = await this.http.get(`/charges/${id}`);
  return ChargeSchema.parse(raw);
}
```
