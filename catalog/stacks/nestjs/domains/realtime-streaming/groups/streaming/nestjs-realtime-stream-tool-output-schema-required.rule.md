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

# Tool outputs defined by schema, not blocklist sanitization

Every agent tool declares an outputSchema; enforce at build time and validate at runtime — never strip internal fields with a growing block list.

## Why it matters

- [data-leak] Blocklist sanitization misses new provider or SDK fields (`thoughtSignature`, `providerMetadata`, `providerOptions`) — model internals leak into Mongo and client-facing API payloads.
- [unclear-failure] A new SDK version adds a field and the block list silently fails until someone notices in production.
- [api-drift] Tool results are `unknown` blobs — persistence, replay, and the frontend cannot rely on a stable contract.

## How to fix

Every tool declares an explicit `outputSchema` (Zod or JSON Schema). The schema is the allowlist: only declared fields are persisted and returned.

1. **Build-time enforcement** — registering a tool without `outputSchema` fails CI (or module load in dev). No exceptions for "internal" tools.
2. **Runtime validation** — parse tool output against `outputSchema` before persistence and before emitting `tool-call-completed` events.
3. **No blocklist sanitizer** — do not maintain a shared `INTERNAL_KEYS` list on run results, messages, or tool calls. If a field should not reach clients, it must not be in the schema.

Provider-only metadata stays inside the LLM adapter layer and never enters the tool execution boundary.

## Incorrect

```typescript
// libs/agents/backend-feature/src/lib/sanitize-run-result.ts
const INTERNAL_KEYS = [
  'providerOptions',
  'providerMetadata',
  'thoughtSignature',
  // grows with every SDK release
];

export function sanitizeRunResult(messages: Message[]): Message[] {
  return messages.map((m) => stripKeys(m, INTERNAL_KEYS));
}

// tool with no output contract
export const searchSiteTool = {
  name: 'search_site',
  execute: async (input) => this.searchService.find(input.query), // raw SDK / DB shape
};
```

## Correct

```typescript
// libs/agents/backend-feature/src/lib/tools/search-site.tool.ts
export const searchSiteTool = defineTool({
  name: 'search_site',
  inputSchema: z.object({ query: z.string().min(1) }),
  outputSchema: z.object({
    matches: z.array(z.object({ id: z.string(), title: z.string() })),
  }),
  execute: async ({ query }) => {
    const raw = await this.searchService.find(query);
    return searchSiteTool.outputSchema.parse(raw);
  },
});

// libs/agents/backend-feature/src/lib/register-tools.ts
export function registerTools(tools: ToolDefinition[]) {
  for (const tool of tools) {
    if (!tool.outputSchema) {
      throw new Error(`Tool "${tool.name}" is missing outputSchema`);
    }
  }
}

// runner — validate before persist / stream
const result = await tool.execute(args);
const safeResult = tool.outputSchema.parse(result);
await this.runs.appendToolCall({ runId, toolCallId, result: safeResult });
```

## When not to apply

Tools that return opaque binary blobs (file downloads) may use a dedicated schema (`z.object({ url: z.string().url() })` or `{ bytes: z.string().base64() }`) rather than skipping validation entirely.
