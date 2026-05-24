---
id: nx-isolation-gov-friction-new-domain
stack: nx
domain: domain-isolation
group: governance
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nx
  - monorepo
  - domain-driven-design
priority: medium
related: []
---

# Raise the friction for adding a new domain

Every new feature shouldn't become its own domain — a domain is a business capability, not a widget.

## Why it matters

- [spreads-failure] Anti-pattern: every new feature becomes a domain → 40 micro-domains → the platform turns into the inverse mess of a monolith.
- [no-ownership] A domain is a business capability, not a feature — without that bar, the catalog dilutes.
- [no-ownership] Simple test: if domain X disappears tomorrow, what business capability vanishes? If the answer is "kind of a widget" — that's not a domain, it's a feature lib inside an existing domain.
- [agent-gets-lost] `enforce-module-boundaries` can't protect libs that were never tagged.
- [agent-gets-lost] Platform graph grows unreadable when every feature is a top-level domain.



## How to fix

Creating a new domain is not a casual decision. It requires tech review, a defined owner, a README, and a CODEOWNERS entry. A domain is a commitment.

## Incorrect

```text
New feature "export widget" → new domain export-widget with one lib and no owner.
```

## Correct

```markdown
New domain checklist:
- Tech review with platform leads
- Named owner team
- README in /apps/<domain>/README.md
- CODEOWNERS for /apps/<domain>/ and /libs/<domain>/
- Nx tags on every lib for enforce-module-boundaries
```
