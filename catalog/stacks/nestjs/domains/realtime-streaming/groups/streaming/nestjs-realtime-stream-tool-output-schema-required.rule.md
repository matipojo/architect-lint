---
id: nestjs-realtime-stream-tool-output-schema-required
stack: nestjs
domain: realtime-streaming
group: streaming
status: active
replaced_by: null
since: 2026-05-25
tags:
  - nestjs
  - sse
  - websocket
  - streaming
  - agents
priority: high
related:
  - nestjs-realtime-stream-structured-agent-events
  - nestjs-realtime-stream-agent-runs-as-resource
---

# Agent payloads use schema allowlists, not blocklist sanitization

Define client and persistence payloads with explicit contracts — never strip internal AI response fields with a deny list.

## Why it matters

- [data-leak] Blocklists miss new provider fields in the AI response — internals leak into Mongo and API payloads.
- [unclear-failure] New fields in the AI response leak until someone updates the deny list.
- [api-drift] Raw AI response parts or unvalidated tool output have no stable contract.

## How to fix

Every tool declares `outputSchema` and returns only schema-validated output from `execute`. Project AI response stream events into your `RunEvent` contract (related structured-events rule). Provider-only metadata stays in the LLM adapter. No deny lists, no destructuring internal fields off a raw response object. Code blocks below are illustrative, not prescriptive.

## Incorrect

```typescript
const INTERNAL_KEYS = ['providerMetadata', 'thoughtSignature'];
export function sanitizeRunResult(msgs: AgentMessage[]) {
  return msgs.map((m) => stripKeys(m, INTERNAL_KEYS));
}
await this.runs.save({ parts: aiResponse.parts });
export const searchSiteTool = {
  execute: async (input) => this.searchService.find(input.query),
};
```

## Correct

```typescript
export const searchSiteTool = defineTool({
  outputSchema: z.object({ matches: z.array(z.object({ id: z.string(), title: z.string() })) }),
  execute: async ({ query }) =>
    searchSiteTool.outputSchema.parse(await this.searchService.find(query)),
});
function toRunEvent(chunk: AgentStreamEvent, out: Map<string, unknown>): RunEvent | null {
  if (chunk.type === 'text-delta') return { type: 'text-delta', delta: chunk.delta };
  if (chunk.type === 'tool-completed') {
    return { type: 'tool-call-completed', toolCallId: chunk.id, result: out.get(chunk.id)! };
  }
  return null;
}
```
