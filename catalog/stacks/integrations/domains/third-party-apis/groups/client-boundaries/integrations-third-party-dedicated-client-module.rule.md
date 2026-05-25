---
id: integrations-third-party-dedicated-client-module
stack: integrations
domain: third-party-apis
group: client-boundaries
status: active
replaced_by: null
since: 2026-05-25
tags:
  - integrations
  - api
priority: high
related:
  - integrations-third-party-response-schema-required
---

# Third-party APIs live in a dedicated client module

External service calls go through one client module per vendor — not scattered `fetch` or SDK usage across features.

## Why it matters

- [hidden-coupling] Feature code imports vendor SDK types — a vendor API change rewrites unrelated screens and jobs.
- [secret-exposure] API keys and base URLs copy-pasted into feature modules — one leak exposes the integration everywhere it was inlined.
- [hard-to-test] No seam to mock — every test that touches a feature hits the real HTTP client or skips the path.

## How to fix

One client library or module per external vendor. It owns auth, base URL, retries, and maps raw responses to your schemas. Application code imports only that client. Code blocks below are illustrative, not prescriptive.

## Incorrect

```typescript
async createCharge(amount: number) {
  const res = await fetch('https://api.vendor.example/v1/charges', {
    headers: { Authorization: `Bearer ${process.env.VENDOR_KEY}` },
    body: JSON.stringify({ amount }),
  });
  return res.json();
}
```

## Correct

```typescript
export class VendorClient {
  createCharge(input: CreateChargeInput): Promise<Charge> {
    return this.http.post('/v1/charges', input).then((raw) => ChargeSchema.parse(raw));
  }
}

await vendorClient.createCharge({ amount });
```
