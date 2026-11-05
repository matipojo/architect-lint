---
id: integrations-third-party-webhook-signature-verification
stack: integrations
domain: third-party-apis
group: client-boundaries
status: active
replaced_by: null
since: 2026-05-25
tags:
  - integrations
  - api
  - webhooks
  - security
priority: high
related:
  - integrations-third-party-response-schema-required
  - integrations-third-party-dedicated-client-module
---

# Webhook endpoints must verify cryptographic signatures before processing payloads

Verify webhook HMAC signatures against the raw payload before decoding JSON or executing business logic.

## Why it matters

- [abuse-vulnerable] Unverified webhook endpoints allow attackers to spoof vendor events and fake state changes.
- [data-corruption] Forged webhook payloads trigger unauthorized mutations in internal databases.
- [data-leak] Processing unverified payloads before authentication leaks execution details to unauthenticated callers.

## How to fix

Verify the vendor's cryptographic signature (HMAC-SHA256) at the boundary using the raw, unparsed request buffer and secret before invoking business logic or parsing the body.

## Incorrect

```typescript
@Post('webhooks/stripe')
async handleWebhook(@Body() event: StripePayload) {
  // Trusting body without verifying signature
  await this.paymentService.markInvoicePaid(event.data.object.id);
  return { received: true };
}
```

## Correct

```typescript
@Post('webhooks/stripe')
async handleWebhook(
  @Req() req: RawBodyRequest<Request>,
  @Headers('stripe-signature') signature: string,
) {
  const event = this.stripe.webhooks.constructEvent(
    req.rawBody,
    signature,
    this.config.webhookSecret,
  );
  await this.paymentService.processEvent(event);
  return { received: true };
}
```
