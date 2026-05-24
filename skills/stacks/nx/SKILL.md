---
name: architect-lint-nx
description: Review Nx architecture principles (14 rules). Read catalog Principle Records at review time — never use cached content.
---

# Nx

When reviewing, **READ** each rule file below. Do not use cached or inlined content.

| Rule | Catalog path | Permalink |
| --- | --- | --- |
| nx-isolation-deps-library-purpose | `catalog/stacks/nx/domains/domain-isolation/groups/dependencies/nx-isolation-deps-library-purpose.rule.md` | https://matipojo.github.io/architect-lint/rules/nx/domain-isolation/nx-isolation-deps-library-purpose |
| nx-isolation-deps-no-global-state | `catalog/stacks/nx/domains/domain-isolation/groups/dependencies/nx-isolation-deps-no-global-state.rule.md` | https://matipojo.github.io/architect-lint/rules/nx/domain-isolation/nx-isolation-deps-no-global-state |
| nx-isolation-deps-one-direction | `catalog/stacks/nx/domains/domain-isolation/groups/dependencies/nx-isolation-deps-one-direction.rule.md` | https://matipojo.github.io/architect-lint/rules/nx/domain-isolation/nx-isolation-deps-one-direction |
| nx-isolation-deps-server-client-boundary | `catalog/stacks/nx/domains/domain-isolation/groups/dependencies/nx-isolation-deps-server-client-boundary.rule.md` | https://matipojo.github.io/architect-lint/rules/nx/domain-isolation/nx-isolation-deps-server-client-boundary |
| nx-isolation-full-separation | `catalog/stacks/nx/domains/domain-isolation/groups/boundaries/nx-isolation-full-separation.rule.md` | https://matipojo.github.io/architect-lint/rules/nx/domain-isolation/nx-isolation-full-separation |
| nx-isolation-gov-friction-new-domain | `catalog/stacks/nx/domains/domain-isolation/groups/governance/nx-isolation-gov-friction-new-domain.rule.md` | https://matipojo.github.io/architect-lint/rules/nx/domain-isolation/nx-isolation-gov-friction-new-domain |
| nx-isolation-nx-tag-contracts | `catalog/stacks/nx/domains/domain-isolation/groups/boundaries/nx-isolation-nx-tag-contracts.rule.md` | https://matipojo.github.io/architect-lint/rules/nx/domain-isolation/nx-isolation-nx-tag-contracts |
| nx-isolation-test-isolation | `catalog/stacks/nx/domains/domain-isolation/groups/boundaries/nx-isolation-test-isolation.rule.md` | https://matipojo.github.io/architect-lint/rules/nx/domain-isolation/nx-isolation-test-isolation |
| nx-monorepo-docs-readme-required | `catalog/stacks/nx/domains/monorepo-hygiene/groups/documentation/nx-monorepo-docs-readme-required.rule.md` | https://matipojo.github.io/architect-lint/rules/nx/monorepo-hygiene/nx-monorepo-docs-readme-required |
| nx-monorepo-owner-build-per-domain | `catalog/stacks/nx/domains/monorepo-hygiene/groups/ownership-build/nx-monorepo-owner-build-per-domain.rule.md` | https://matipojo.github.io/architect-lint/rules/nx/monorepo-hygiene/nx-monorepo-owner-build-per-domain |
| nx-monorepo-owner-codeowners-boundaries | `catalog/stacks/nx/domains/monorepo-hygiene/groups/ownership-build/nx-monorepo-owner-codeowners-boundaries.rule.md` | https://matipojo.github.io/architect-lint/rules/nx/monorepo-hygiene/nx-monorepo-owner-codeowners-boundaries |
| nx-monorepo-schema-config-at-entry | `catalog/stacks/nx/domains/monorepo-hygiene/groups/schemas-config/nx-monorepo-schema-config-at-entry.rule.md` | https://matipojo.github.io/architect-lint/rules/nx/monorepo-hygiene/nx-monorepo-schema-config-at-entry |
| nx-monorepo-schema-single-source | `catalog/stacks/nx/domains/monorepo-hygiene/groups/schemas-config/nx-monorepo-schema-single-source.rule.md` | https://matipojo.github.io/architect-lint/rules/nx/monorepo-hygiene/nx-monorepo-schema-single-source |
| nx-testing-three-tiers | `catalog/stacks/nx/domains/testing-contracts/groups/contracts/nx-testing-three-tiers.rule.md` | https://matipojo.github.io/architect-lint/rules/nx/testing-contracts/nx-testing-three-tiers |

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
