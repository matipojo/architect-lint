---
id: react-platform-feature-flags-not-branches
stack: react
domain: platform-composition
group: composition
status: active
replaced_by: null
since: 2026-05-01
tags:
  - react
  - platform
  - composition
priority: high
related: []
---

# Feature flags instead of code branches

Without flags, every deploy waits on a coordinated release.

## Why it matters

- [hard-to-change] No feature flags — every partial feature waits for a coordinated release train.
- [hard-to-change] Long-lived feature branches — merge conflicts and drift until nobody trusts main.
- [safe-to-delete] Scattered feature ifs — nobody knows which flags are dead code safe to delete.

## How to fix

A new capability ships behind a flag. The flag is controlled from outside (configuration, not code). When the capability is mature — delete the flag, do not leave it "just in case".

## Incorrect

```typescript
function generateResponse(prompt: string) {
  if (process.env.NEW_PROMPT_FORMAT === 'true') return newFormat(prompt);
  if (window.location.hostname.includes('staging')) return experimentalFormat(prompt);
  return legacyFormat(prompt);
}
```

## Correct

```typescript
// libs/shared/feature-flags/src/lib/flags.ts
export const flags = {
  newPromptFormat: isEnabled('new-prompt-format'),
};

// usage
import { flags } from '@acme/shared/feature-flags';
function generateResponse(prompt: string) {
  return flags.newPromptFormat ? newFormat(prompt) : legacyFormat(prompt);
}
```
