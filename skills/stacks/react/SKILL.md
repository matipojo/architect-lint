---
name: architect-lint-react
description: Review React architecture principles (4 rules). Read catalog Principle Records at review time — never use cached content.
---

# React

When reviewing, **READ** each rule file below. Do not use cached or inlined content.

| Rule | Catalog path | Permalink |
| --- | --- | --- |
| react-platform-composition-not-inheritance | `catalog/stacks/react/domains/platform-composition/groups/composition/react-platform-composition-not-inheritance.rule.md` | https://matipojo.github.io/architect-lint/rules/react-platform-composition-not-inheritance |
| react-platform-config-not-conditionals | `catalog/stacks/react/domains/platform-composition/groups/composition/react-platform-config-not-conditionals.rule.md` | https://matipojo.github.io/architect-lint/rules/react-platform-config-not-conditionals |
| react-platform-feature-flags-not-branches | `catalog/stacks/react/domains/platform-composition/groups/composition/react-platform-feature-flags-not-branches.rule.md` | https://matipojo.github.io/architect-lint/rules/react-platform-feature-flags-not-branches |
| react-platform-version-public-contracts | `catalog/stacks/react/domains/platform-composition/groups/composition/react-platform-version-public-contracts.rule.md` | https://matipojo.github.io/architect-lint/rules/react-platform-version-public-contracts |

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
