---
name: angie-architect
description: Route Angie architecture work to the right professional-architecture skill. Use when designing or reviewing Angie backend/frontend structure, running architecture audits, or when the user asks about Angie architectural standards, domain boundaries, NestJS patterns, or monorepo hygiene.
---

# Angie Architect

Orchestrator for the nine Angie professional-architecture skills bundled in this plugin. Pick the narrowest skill that matches the task; read its `SKILL.md` before changing code or writing review findings.

## Skill index

| Skill | Use when |
| --- | --- |
| `professional-architecture-domain-isolation` | Domain boundaries, cross-domain imports, `apps/` vs `packages/` layout, spinning up a domain in isolation |
| `professional-architecture-monorepo-hygiene` | README per domain, SSOT schemas/types, env at bootstrap, CODEOWNERS, per-domain build artifacts |
| `professional-architecture-nestjs-modules` | New NestJS module, controller, DTO, ConfigModule, dynamic modules, OpenAPI |
| `professional-architecture-nestjs-data-errors` | Guards doing queries, typed exceptions, repository interfaces, transactions, cross-domain async |
| `professional-architecture-auth-security` | Auth vs authz, Passport strategies, policies, IDOR, tenant scoping, secrets, rate limits |
| `professional-architecture-platform-composition` | Shared UI across hosts, feature flags, configuration over context branching |
| `professional-architecture-realtime-streaming` | SSE vs WebSocket, LLM stream cancel/backpressure, agent run durability; see rule 42 cancellation modes vs 47 |
| `professional-architecture-runtime-resilience` | Error boundaries, structured observability, per-domain migrations |
| `professional-architecture-testing-contracts` | Typed API clients, unit/integration/e2e split, compile-time contract checks |

## Workflow

1. Identify the concern (security, data layer, monorepo layout, streaming, etc.).
2. Read the matching skill under `skills/<skill-name>/SKILL.md`.
3. Apply only the rules relevant to the change; cite rule numbers in reviews.
4. For full-repo audits, spawn one subagent per `professional-architecture-*` skill (see `.github/architecture-review-prompt.md`).

## Repo context

- Monorepo layout: `apps/*`, `packages/*` (Nx + pnpm).
- Follow existing repo rules in `.cursor/rules/` alongside these architecture skills.
