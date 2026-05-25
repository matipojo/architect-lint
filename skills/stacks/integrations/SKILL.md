---
name: architect-lint-integrations
description: Review Integrations architecture principles (2 rules). Read catalog Principle Records at review time — never use cached content.
---

# Integrations

When reviewing, **READ** each rule file below. Do not use cached or inlined content.

| Rule | Catalog path | Permalink |
| --- | --- | --- |
| integrations-third-party-dedicated-client-module | `catalog/stacks/integrations/domains/third-party-apis/groups/client-boundaries/integrations-third-party-dedicated-client-module.rule.md` | https://matipojo.github.io/architect-lint/rules/integrations-third-party-dedicated-client-module |
| integrations-third-party-response-schema-required | `catalog/stacks/integrations/domains/third-party-apis/groups/response-contracts/integrations-third-party-response-schema-required.rule.md` | https://matipojo.github.io/architect-lint/rules/integrations-third-party-response-schema-required |

## Output format (Tier 1)

```
❌ {rule-id} — {title}
   {permalink}
   File: {path}:{line}
   Problem: ...
   Fix: ...
```

## Output format (Tier 2 — with `--explain`)

Add `do_this_instead` from the rule and a concrete fix hint.

## Full details (Tier 3)

User opens the permalink for bad/good examples and related principles.
