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

- Turns architectural boundaries from suggestion into process — cannot be bypassed in review.
- Shared code changes get platform-lead eyes before they land.

## Issues

- [governance] Without domain-scoped owners, cross-domain edits merge without the team that will be paged.
- [blast-radius] a late-night tweak to `libs/shared/*` can break multiple apps before anyone notices.


## How to fix

Map `.github/CODEOWNERS` per domain. A PR touching `libs/studio/*` requires Studio-team approval. A PR touching `libs/shared/*` requires platform-leads approval.

## Incorrect

```text
# .github/CODEOWNERS
* @angie/everyone
```

## Correct

```text
# .github/CODEOWNERS
/apps/sites-management/      @angie/team-sites
/libs/sites-management/      @angie/team-sites
/apps/studio/                @angie/team-studio
/libs/studio/                @angie/team-studio
/libs/shared/                @angie/platform-leads
/nx.json                     @angie/platform-leads
/.github/                    @angie/platform-leads
```
