---
id: nx-monorepo-owner-codeowners-boundaries
stack: nx
domain: monorepo-hygiene
group: ownership-build
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nx
  - monorepo
  - documentation
priority: medium
related: []
---

# CODEOWNERS reflects the boundaries

Without it, someone "just" tweaks the core at 2 AM and three domains break by morning.

## Why it matters

- [no-ownership] Without CODEOWNERS, boundary rules are comments — cross-domain PRs merge unnoticed.
- [spreads-failure] Midnight tweak to shared/ — no platform review, multiple apps red before standup.
- [no-ownership] Without domain-scoped owners, cross-domain edits merge without the team that will be paged.
- [spreads-failure] a late-night tweak to `libs/shared/*` can break multiple apps before anyone notices.

## How to fix

Map `.github/CODEOWNERS` per domain. A PR touching `libs/studio/*` requires Studio-team approval. A PR touching `libs/shared/*` requires platform-leads approval.

## Incorrect

```text
# .github/CODEOWNERS
* @acme/everyone
```

## Correct

```text
# .github/CODEOWNERS
/apps/sites-management/      @acme/team-sites
/libs/sites-management/      @acme/team-sites
/apps/studio/                @acme/team-studio
/libs/studio/                @acme/team-studio
/libs/shared/                @acme/platform-leads
/nx.json                     @acme/platform-leads
/.github/                    @acme/platform-leads
```
