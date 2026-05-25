---
id: nx-monorepo-principle-record-brevity
stack: nx
domain: monorepo-hygiene
group: documentation
status: active
replaced_by: null
since: 2026-05-25
tags:
  - nx
  - monorepo
  - documentation
priority: medium
related:
  - nx-monorepo-docs-readme-required
---

# Principle records — 60–70 lines max

Keep architect-lint `.rule.md` files short: one principle, compact examples, link related rules for depth.

## Why it matters

- [agent-gets-lost] Long principle records bury the rule — reviewers and agents skip the middle and miss the actual constraint.
- [hard-to-change] Bloated examples duplicate what related rules already say — two places drift when one changes.

## How to fix

Target **60–70 lines** per `.rule.md` (including frontmatter). `pnpm validate` fails above **70** for rules added on or after 2026-05-25.

One principle per file. Two or three tagged bullets in "Why it matters". One short "How to fix" paragraph. Incorrect and Correct examples show the pattern only — not full implementations. Split into a second rule or use `related:` when you need more depth.

## Incorrect

```markdown
# Agent payloads use schema allowlists, not blocklist sanitization

(117 lines: three essay paragraphs, two 40-line code blocks,
registerTools helper, toRunEvent mapper, and blocklist variants
all in one file)
```

## Correct

```markdown
# Agent payloads use schema allowlists, not blocklist sanitization

(~65 lines: three bullets, one paragraph how-to-fix,
15-line incorrect block, 20-line correct block,
related: nestjs-realtime-stream-structured-agent-events)
```

## When not to apply

Legacy rules above 70 lines may remain until edited — then trim or split to meet the limit.
