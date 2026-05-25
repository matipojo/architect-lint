# Migration gap analysis — master SKILL.md → catalog `.rule.md`

**Scope:** 50 catalog rules vs 9 master files on `main` (extracted to `/tmp/main-skills/`)
**Mapping:** All 50 numbered master rules (1–50, excluding meta-sections) map 1:1 to a catalog `.rule.md`. No numbered-rule orphans. Loss is in depth, not coverage.

---

## nestjs → auth-security

### authn-authz

#### nestjs-auth-separate-authn-authz
- master rule: `## 34. Authentication and Authorization are two different layers` in `skills__professional-architecture-auth-security__SKILL.md`
- gaps:
  - Intro line is a compressed restatement; master opens with the definitional punch ("Authentication = who you are…")
  - "How to fix" duplicates master intro instead of prescriptive enforcement steps
  - Lost closing line: "`JwtAuthGuard` only identifies. `SitesService` decides…"
  - All bullets carry `[tag]:` prefixes (migration script artifact)
- sharpness fixes:
  - Move definitional opener back into summary or first "How to fix" sentence
  - Add closing mechanism sentence from master lines 77–78
  - Strip `[hard-to-change]` / `[layer-mixing]` prefixes; keep tags in YAML only or separate metadata
- severity: **medium**

#### nestjs-auth-one-passport-strategy-per-method
- master rule: `## 35. Passport Strategies — one per auth method, no more`
- gaps:
  - Master had no ❌ Bad block; catalog added one (improvement)
  - Lost master bullet: "Each strategy answers exactly one question: 'who is the user on this request?'"
  - `[tag]:` prefixes on all Why bullets
  - "How to fix" is master intro prose, not fix guidance
- sharpness fixes:
  - Restore the "one question per strategy" bullet from master lines 86–87
  - Keep the new Incorrect mega-strategy example
- severity: **low**

#### nestjs-auth-policies-not-decorators
- master rule: `## 36. Authorization = Policies, not decorators sprinkled across the code`
- gaps:
  - Lost master bullet: same policy applies in UI and backend (one policy, two consumers)
  - Replaced with `[data-leak]` UI/backend drift bullet — related but not identical
  - Lost closing: "Exposable to the frontend as `canUpdate(site)` to hide buttons"
  - `[tag]:` prefixes throughout
- sharpness fixes:
  - Restore UI+backend single-policy bullet from master lines 122–123
  - Add closing frontend-exposure sentence from master line 166
- severity: **medium**

### security-hardening

#### nestjs-security-authorize-from-db-object
- master rule: `## 37. Always authorize on an object loaded from the DB, not on user input`
- gaps:
  - Examples preserved well (near-equal)
  - "How to fix" repeats master mechanism prose verbatim
  - `[tag]:` prefixes; duplicate `[data-leak]` tags
- sharpness fixes:
  - Rewrite "How to fix" as steps: load → 404 → policy check → mutate
  - Drop tag prefixes from bullet text
- severity: **low**

#### nestjs-security-tenant-required-scope
- master rule: `## 38. Multi-tenancy — tenant is a required scope, not a reminder`
- gaps:
  - Lost master closing: "Even stronger: row-level security in Postgres…"
  - "How to fix" is mechanism prose, not enforcement checklist
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore Postgres RLS paragraph from master lines 252–253
  - Add prescriptive "How to fix": middleware → AsyncLocalStorage → repo auto-filter
- severity: **medium**

#### nestjs-security-no-secrets-in-code
- master rule: `## 39. Secrets don't sit in code or logs`
- gaps:
  - Code examples largely preserved
  - Intro generic vs master's concrete scope (API keys, JWT secrets, DB passwords)
  - `[tag]:` prefixes
- sharpness fixes:
  - Expand intro with master's explicit secret types (line 258)
- severity: **low**

#### nestjs-security-rate-limit-csrf-infrastructure
- master rule: `## 40. Rate limiting and CSRF are infrastructure, not optional`
- gaps:
  - Catalog added Incorrect example (improvement over master Good-only)
  - Lost master bullets: "Without rate limiting…" and "'We'll handle it later' = never"
  - Correct block omits CSRF and helmet entirely — master mentions all three
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore both Why bullets from master lines 299–301
  - Expand Correct with CSRF + `helmet` baseline, not just Throttler
- severity: **high** (reader may think throttling alone satisfies the rule)

---

## nestjs → nestjs-data-errors

### infrastructure

#### nestjs-infra-guards-not-business-logic
- master rule: `## 25. Guards and Interceptors — cross-cutting infrastructure, not business logic`
- gaps:
  - Examples preserved well
  - Lost master definitional split for Guard vs Interceptor in opening (partially in How to fix)
  - `[tag]:` prefixes
- sharpness fixes:
  - Move Guard/Interceptor definitions into summary line
- severity: **low**

### data-access

#### nestjs-data-nestjs-exceptions
- master rule: `## 28. Errors — NestJS exceptions, not throw new Error`
- gaps:
  - Lost entire "Even better: domain exceptions mapped by a filter" section (~20 lines)
  - Lost bullet: "A NestJS exception filter can map exceptions to a unified error format"
  - Second Why bullet is migration-added, not in master
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore domain-exception + filter pattern from master lines 103–123
  - Restore filter bullet from master line 75
- severity: **high** (standalone reader misses the preferred architecture)

#### nestjs-data-repository-pattern
- master rule: `## 29. Repository pattern — don't expose the ORM to services`
- gaps:
  - Examples near-equal
  - One Why bullet reframed as benefit ("In tests, you can mock…") vs master failure framing
  - `[tag]:` prefixes
- sharpness fixes:
  - Reframe `[hard-to-test]` bullet as failure: "Tests must mock entire ORM instead of one interface"
- severity: **low**

#### nestjs-data-transactions-at-use-case
- master rule: `## 30. Transactions sit at the use-case boundary, not inside a repository call`
- gaps:
  - Added `[data-corruption]` orphan-site bullet (improvement)
  - Lost master closing: "Or with Prisma `$transaction`… principle is identical"
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore Prisma/CLS alternative note from master lines 233–234
- severity: **low**

#### nestjs-data-jobs-in-owning-domain
- master rule: `## 31. Background jobs and events — inside the owning domain`
- gaps:
  - Lost second Why bullet: "Events are how domains coordinate without one knowing the other's internals"
  - Only one Why bullet remains
  - Examples preserved with domain rename (studio→workspace)
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore events-as-coordination bullet from master line 245
- severity: **medium**

---

## nestjs → nestjs-modules

### module-structure

#### nestjs-module-domain-standalone
- master rule: `## 22. Every domain is a standalone NestJS Module`
- gaps:
  - Intro is failure-framed stub vs master principle
  - Lost closing: "You can spin up a microservice that loads only `SitesModule`"
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore microservice/test isolation payoff from master line 63
- severity: **medium**

#### nestjs-module-cross-module-via-services
- master rule: `## 23. Cross-module communication via exported services, not repositories or DB`
- gaps:
  - Lost third Why bullet: service is where validation, authorization, logging are enforced
  - Why bullets reframed with different stake tags
  - Examples preserved
- sharpness fixes:
  - Restore validation/auth/logging bullet from master line 74
- severity: **medium**

#### nestjs-module-dtos-not-entities-in-controllers
- master rule: `## 24. DTOs in controllers, entities in repositories — never mixed`
- gaps:
  - Lost Why bullet on `class-validator` and over-posting protection
  - Lost master prose on leaked columns (`internalSecretKey`, `deletedAt`, etc.)
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore class-validator/over-posting bullet from master lines 129–130
  - Add leaked-column list from master line 149
- severity: **medium**

### configuration

#### nestjs-config-module-not-process-env
- master rule: `## 26. Configuration via ConfigModule, not process.env`
- gaps:
  - Mis-tagged Why bullet: `[drops-connection]` used for boot validation (wrong stake type)
  - Examples preserved
  - `[tag]:` prefixes
- sharpness fixes:
  - Retag boot-validation bullet (e.g. `unclear-failure` or untagged prose)
  - Restore master reference to rule 16 in prose
- severity: **low**

#### nestjs-config-for-root-async
- master rule: `## 27. forRootAsync for modules with dependent configuration`
- gaps:
  - Lost Why bullets on different environments and synthetic test config (replaced with similar but shorter bullets)
  - Lost closing: "`RedisModule` doesn't know about `ConfigService`. It knows about a factory."
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore factory-inversion closing from master line 292
- severity: **low**

#### nestjs-config-openapi-from-code
- master rule: `## 33. OpenAPI / Swagger is generated from code, not maintained by hand`
- gaps:
  - Added Incorrect hand-YAML example (improvement)
  - Lost CI pipeline sentence: `nx run api:export-openapi` → `generate-client`
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore CI codegen pipeline from master lines 321–322
- severity: **medium**

---

## nestjs → realtime-streaming

### streaming

#### nestjs-realtime-stream-llm-cancellation-backpressure
- master rule: `## 42. LLM streaming — cancellation and backpressure are mandatory`
- gaps:
  - **Critical loss:** entire "Cancellation mode depends on run durability" table (Ephemeral / Durable / Cost guard / Explicit only)
  - **Critical loss:** page-refresh vs tab-close identical-to-server explanation
  - **Critical loss:** "How rules 42, 45, and 47 interact" — naive `req.on('close')` breaks durable resume
  - Backpressure mentioned in How to fix but no implementation guidance beyond abort example
  - Third Why bullet is truncated/incomplete sentence
  - Correct example always aborts on disconnect — contradicts durable-run guidance in master
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore full cancellation-mode table from master lines 129–145
  - Add "do not assume resume-first" product decision block from master lines 136–143
  - Cross-link related rules with explicit tension resolution text
  - Fix incomplete Why bullet
- severity: **high**

#### nestjs-realtime-stream-agent-runs-as-resource
- master rule: `## 47. Agent runs are a resource, not an ephemeral stream`
- gaps:
  - Intro is a Why bullet, not master principle
  - Lost closing: "The stream is a window into the resource, not the resource itself"
  - Lost requirement: documented disconnect policy (refs rule 42)
  - Lost explicit cancel endpoints narrative beyond code
  - Incorrect is stub comment-only (acceptable but thin)
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore closing mechanism sentence from master line 343
  - Add disconnect-policy requirement from master lines 345–346
- severity: **high**

#### nestjs-realtime-stream-structured-agent-events
- master rule: `## 48. Tool calls and agent output — structured events, not free text`
- gaps:
  - Master had Good-only; catalog added Incorrect (improvement)
  - Lost Why bullet on analytics/debugging from same stream
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore analytics/debugging bullet from master line 355
- severity: **medium**

#### nestjs-realtime-stream-idempotency-keys
- master rule: `## 49. Idempotency keys on every agent action`
- gaps:
  - Near-equal to master
  - Lost "This is the industry standard (Stripe)" anchor
  - `[tag]:` prefixes; duplicate `[double-charge]` tags
- sharpness fixes:
  - Restore Stripe/industry-standard line from master line 389
- severity: **low**

#### nestjs-realtime-stream-heartbeats-reconnect
- master rule: `## 50. Heartbeats and reconnect — part of the protocol, not an add-on`
- gaps:
  - Added Incorrect stub (improvement)
  - Added extra Why bullet on `Last-Event-Id` (improvement)
  - Lost master bullet: "LLM streaming has long pauses between tokens (tool calls)"
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore tool-call pause rationale from master line 419
- severity: **low**

### transport

#### nestjs-realtime-transport-sse-vs-websocket
- master rule: `## 41. Pick one mechanism per flow — don't confuse SSE with WebSocket`
- gaps:
  - Lost Why bullet: "For LLM response streaming — SSE wins big: HTTP/2, proxies…"
  - Correct SSE example dropped try/catch error handling from master
  - Mechanism list preserved in How to fix
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore SSE operational advantage bullet from master lines 21–22
  - Restore error handling in Correct example (master lines 50–57)
- severity: **medium**

#### nestjs-realtime-transport-thin-gateway
- master rule: `## 43. WebSocket Gateways — thin transport, not business logic`
- gaps:
  - Lost two Why bullets (gateway is transport; same service reachable over HTTP)
  - Only one Why bullet remains
  - Examples preserved
- sharpness fixes:
  - Restore both master Why bullets from lines 153–155
- severity: **medium**

#### nestjs-realtime-transport-ws-auth-at-handshake
- master rule: `## 44. WebSocket auth — at handshake, not per message`
- gaps:
  - Added Incorrect per-message JWT example (improvement over master Good-only)
  - Near-equal otherwise
  - `[tag]:` prefixes
- sharpness fixes:
  - Minor: note token placement options in summary
- severity: **low** (catalog slightly better)

#### nestjs-realtime-transport-redis-adapter-scaling
- master rule: `## 45. Scaling real-time — via Redis adapter, not in-memory`
- gaps:
  - Added Incorrect in-memory-only stub (improvement)
  - **Lost paragraph:** SSE resumable streams + Redis relay for cross-instance resume (master lines 265–266)
  - Lost closing: "`server.to(roomId).emit(...)` now reaches every instance…"
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore SSE resume relay paragraph from master lines 265–266
  - Restore fan-out closing line from master line 263
- severity: **high** (standalone reader misses SSE scaling path)

#### nestjs-realtime-transport-namespaced-rooms
- master rule: `## 46. Rooms and channels — always namespaced by domain and tenant`
- gaps:
  - Lost second Why bullet: "Same problem as multi-tenancy in the DB, but on the real-time channel"
  - Only one Why bullet
  - Examples preserved
- sharpness fixes:
  - Restore DB-parallel tenancy bullet from master line 275
- severity: **medium**

---

## nestjs → runtime-resilience

### resilience

#### nestjs-resilience-error-boundaries-per-domain
- master rule: `## 14. Error boundaries per domain`
- gaps:
  - Near-equal; examples preserved with domain rename
  - Lost closing: "Studio falls → Sites and Account keep working. Telemetry has the domain attached."
  - Wrong YAML tags: `react` listed under nestjs runtime-resilience rule
  - `[tag]:` prefixes
- sharpness fixes:
  - Fix frontmatter tags to reflect React runtime concern
  - Restore closing payoff sentence
- severity: **low**

#### nestjs-resilience-observability-infrastructure
- master rule: `## 17. Observability is infrastructure, not an add-on`
- gaps:
  - Near-equal examples
  - Lost closing query example: `` `domain:sites-management event:site.created` ``
  - Wrong stack tags in frontmatter
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore searchable query example from master line 105
  - Fix frontmatter tags
- severity: **low**

#### nestjs-resilience-migrations-in-domain
- master rule: `## 18. Migrations are part of the domain`
- gaps:
  - **Correct example is wrong:** shows index migration in catalog domain, not FK-direction guidance
  - Lost master Good bullets: consumer holds link in own table; FK direction matters
  - Lost list-format Good section entirely (4 bullets)
  - `[tag]:` prefixes
- sharpness fixes:
  - Replace Correct with master's `agents.site_id` pattern (lines 126–129)
  - Restore FK-direction rule prose
- severity: **high**

---

## nestjs → testing-contracts

### contracts

#### nestjs-testing-generated-client-not-fetch
- master rule: `## 15. Backend ↔ frontend communication via a generated client, not fetch`
- gaps:
  - Lost pipeline sentence: export-openapi → generate-client in PR CI
  - Lost cross-ref to rule 13
  - Added extra Why bullets (mixed improvement/regression)
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore CI pipeline from master lines 44–45
- severity: **medium**

---

## nx → domain-isolation

### boundaries

#### nx-isolation-full-separation
- master rule: `## 1. Full separation between domains`
- gaps:
  - Intro is a Why bullet ("Dev speed…"), not master test definition
  - Why bullets rewritten; lost positive framing (dev speed, blast radius, ownership, parallel teams) as distinct master bullets — partially preserved but reframed as failures
  - Lost test commands: `` `nx serve sites-management` ``, `` `nx graph` shows islands ``
  - Lost entire "Nx tooling that enforces these rules" section (not numbered, but instructional)
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore standalone test paragraph from master lines 16–17, 57–58
  - Consider separate "Enforcement tooling" callout or link
- severity: **high**

#### nx-isolation-test-isolation
- master rule: `## 2. Full test isolation`
- gaps:
  - **Lost TypeScript bad/good test examples entirely** (master lines 77–106)
  - Only YAML CI snippet remains
  - Lost closing: "A test that needs the whole system up = red flag…"
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore full TS Incorrect/ Correct blocks from master
  - Restore red-flag closing from master line 108
- severity: **high**

#### nx-isolation-nx-tag-contracts
- master rule: `## 4. Explicit cross-domain contracts via Nx tags`
- gaps:
  - Lost Why bullet: "The public API is the only surface that needs strict review"
  - Lost prose: tag each lib's `project.json`, import `@angie/...`, lint screams
  - Correct block is ESLint JSON only — missing import path narrative
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore public-API review bullet from master line 119
  - Add barrel-import + project.json tags prose from master lines 147–148
- severity: **medium**

### dependencies

#### nx-isolation-deps-no-global-state
- master rule: `## 5. No shared global state`
- gaps:
  - Near-equal examples
  - Lost closing: "Data enters through the front door. There is no back door."
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore closing line from master line 188
- severity: **low**

#### nx-isolation-deps-one-direction
- master rule: `## 9. Dependencies flow one direction`
- gaps:
  - **Only one Why bullet** vs master's two ("Once shared knows a domain…" + "lets you add a new domain without touching shared")
  - Lost closing: "`nx graph` shows flow goes one way"
  - Examples preserved
- sharpness fixes:
  - Restore second Why bullet from master line 198
  - Restore nx graph closing from master line 235
- severity: **medium**

#### nx-isolation-deps-library-purpose
- master rule: `## 11. Every library has one purpose — feature, data-access, ui, or util`
- gaps:
  - Why bullets rewritten/expanded (4 vs 4) — mostly OK but lost crisp master bullets on pure UI Storybook, data-access mockability, feature composes both
  - Lost closing: "`SiteCard` lives in Storybook… `useSite` is testable alone. The container is the glue."
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore three-layer payoff closing from master lines 292–293
- severity: **medium**

#### nx-isolation-deps-server-client-boundary
- master rule: `## 12. Clear server vs client boundary`
- gaps:
  - Lost master explanatory prose after bad example: "The frontend imports `formatDate` and drags `crypto` with it"
  - Lost closing: "ESLint screams if a frontend app imports from `util-server`"
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore bundler consequence sentence from master lines 313–314, 324
- severity: **medium**

### governance

#### nx-isolation-gov-friction-new-domain
- master rule: `## 21. Raise the friction for adding a new domain`
- gaps:
  - Added agent-gets-lost bullets (not in master — OK)
  - Lost master checklist item phrasing: "Without all five, the domain doesn't exist"
  - Correct is markdown checklist vs master bullet list — acceptable
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore hard gate line from master line 345
- severity: **low**

---

## nx → monorepo-hygiene

### documentation

#### nx-monorepo-docs-readme-required
- master rule: `## 10. Documentation in a place you can't miss`
- gaps:
  - Good README example preserved (nested fence awkward but content OK)
  - Lost master bad narrative: "A new developer opens the folder and starts reading random files"
  - `[tag]:` prefixes
- sharpness fixes:
  - Add bad-outcome prose under Incorrect text block
- severity: **low**

### ownership-build

#### nx-monorepo-owner-build-per-domain
- master rule: `## 20. Build artifacts are per-domain`
- gaps:
  - Lost three Good bullets: Docker image per app, `nx affected --target=build`, prod updates only changed domain
  - Only one Why bullet vs master's rollback/deployment narrative
  - Minimal stub examples
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore three Good bullets from master lines 187–189
- severity: **medium**

#### nx-monorepo-owner-codeowners-boundaries
- master rule: `## 19. CODEOWNERS reflects the boundaries`
- gaps:
  - Added Incorrect `* @everyone` (improvement)
  - Lost closing: "A change in `shared` cannot land without platform-leads approval. Period."
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore closing enforcement line from master line 169
- severity: **low**

### schemas-config

#### nx-monorepo-schema-single-source
- master rule: `## 13. Schemas and types — one source of truth`
- gaps:
  - Lost second Why bullet: Zod gives runtime validation + compile-time type
  - Lost closing: "Schema change = both sides change, automatically, at compile time"
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore Zod bullet from master lines 68–69
  - Restore compile-time sync closing from master line 98
- severity: **medium**

#### nx-monorepo-schema-config-at-entry
- master rule: `## 16. Configuration is read at the entry point, not in the middle of the code`
- gaps:
  - Near-equal examples
  - Lost master story: "When did you find out `OPENAI_API_KEY` was missing? When a user clicked the chat."
  - Lost NestJS cross-ref to rule 26
  - Mis-tagged `[drops-connection]` for env scatter
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore late-failure story from master lines 120–121
  - Fix stake tags
- severity: **medium**

---

## nx → testing-contracts

### contracts

#### nx-testing-three-tiers
- master rule: `## 32. Testing — three tiers, not one`
- gaps:
  - Added Incorrect e2e-only example (improvement)
  - Added extra Why bullet on api-drift (not in master)
  - Lost tier-diagnosis prose: "unit fails → logic. integration fails → wiring. e2e fails → contract"
  - Lost timing guidance: "Unit is seconds, integration tens of seconds…"
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore failure-layer diagnosis from master line 58
  - Restore CI timing guidance from master line 94
- severity: **medium**

---

## react → platform-composition

### composition

#### react-platform-config-not-conditionals
- master rule: `## 3. Configuration, not conditionals`
- gaps:
  - Near-equal; examples preserved with generic host names
  - Lost master Why bullet: "New context = compose different props. Don't touch the lib."
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore "new context" bullet from master line 20
- severity: **low**

#### react-platform-composition-not-inheritance
- master rule: `## 6. Composition, not inheritance`
- gaps:
  - **Only one Why bullet** vs master's two (Storybook + "enables reuse without variants")
  - Examples preserved
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore second Why bullet from master line 78
- severity: **medium**

#### react-platform-feature-flags-not-branches
- master rule: `## 7. Feature flags instead of code branches`
- gaps:
  - Intro is failure stub vs master principle
  - Why bullets rewritten; lost master bullets on deploy-without-release and replacing scattered ifs
  - Lost closing deletion recipe: "delete the flag, delete `legacyFormat`, delete the ternary"
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore master Why bullets from lines 124–126
  - Restore flag cleanup closing from master line 155
- severity: **medium**

#### react-platform-version-public-contracts
- master rule: `## 8. Version your public contracts`
- gaps:
  - Correct block is package.json exports only — **lost consumer import examples** (`/v1`, `/v2`)
  - Lost closing: "`v1` is deleted only when `nx graph` shows it has no consumers"
  - `[tag]:` prefixes
- sharpness fixes:
  - Restore consumer import examples from master lines 193–197
  - Restore deprecation gate from master line 199
- severity: **medium**

---

## Cross-cutting issues

1. **`[tag]:` prefixes on every Why bullet** — all 50 rules; migration script output, not reader-facing prose.
2. **"How to fix" = master intro, not fix guidance** — ~45/50 rules paste principle text instead of enforceable steps.
3. **Summary line often a failure stub** — loses master's definitional opener ("Authentication = who you are…", "Every domain is a standalone app…").
4. **Lost closing mechanism sentences** — ~30 rules drop the one-line "so what" after examples.
5. **Lost cross-rule sections** — realtime 42/45/47 interaction, platform-composition reinforcement, testing-contracts interaction, domain-isolation Nx tooling.
6. **Truncated Why sections** — many rules dropped 1–3 master bullets (especially when master had 2–4).
7. **Mis-tagged stakes** — e.g. `[drops-connection]` for boot validation, `[hard-to-test]` phrased as benefits.
8. **Wrong frontmatter tags** — `nestjs-resilience-*` rules tagged `react` in YAML.
9. **Domain anonymization** — sites-management/studio/WordPress → catalog/workspace/embedded-host; loses Angie anchors but examples still work.
10. **Incorrect examples added where master had Good-only** — net improvement for rules 35, 40, 44, 48, 19 (CODEOWNERS), 33 (OpenAPI), 32 (testing).

---

## Top 10 strictly worse than master (by severity)

| Rank | rule-id | Why |
|------|---------|-----|
| 1 | `nestjs-realtime-stream-llm-cancellation-backpressure` | Lost durable vs ephemeral cancel policy — reader will mis-implement durable runs |
| 2 | `nestjs-realtime-stream-agent-runs-as-resource` | Lost disconnect-policy requirement and resource-vs-stream framing |
| 3 | `nestjs-resilience-migrations-in-domain` | Correct example contradicts master FK-direction guidance |
| 4 | `nx-isolation-test-isolation` | Lost TS test examples — CI YAML alone doesn't teach the rule |
| 5 | `nestjs-security-rate-limit-csrf-infrastructure` | Correct omits CSRF/helmet; reader thinks throttling is enough |
| 6 | `nestjs-realtime-transport-redis-adapter-scaling` | Lost SSE cross-instance resume path |
| 7 | `nx-isolation-full-separation` | Lost runnable-alone test + nx serve/graph verification |
| 8 | `nestjs-data-nestjs-exceptions` | Lost domain-exception filter pattern (preferred architecture) |
| 9 | `nx-isolation-deps-one-direction` | Single Why bullet — misses "add domain without touching shared" |
| 10 | `react-platform-composition-not-inheritance` | Single Why bullet — misses reuse-without-variants rationale |

---

## Rules equal or better than master

- **Better:** `nestjs-auth-one-passport-strategy-per-method`, `nestjs-security-rate-limit-csrf-infrastructure` (added Incorrect), `nestjs-realtime-transport-ws-auth-at-handshake`, `nestjs-realtime-stream-structured-agent-events`, `nestjs-config-openapi-from-code`, `nx-monorepo-owner-codeowners-boundaries`, `nx-testing-three-tiers`, `nestjs-data-transactions-at-use-case` (orphan-site bullet)
- **Near-equal:** `nestjs-auth-separate-authn-authz`, `nestjs-security-authorize-from-db-object`, `nestjs-infra-guards-not-business-logic`, `nestjs-data-repository-pattern`, `nestjs-module-dtos-not-entities-in-controllers`, `nestjs-realtime-stream-idempotency-keys`, `react-platform-config-not-conditionals`, `nx-isolation-deps-no-global-state`

---

## Master content with NO corresponding `.rule.md` (orphans)

Numbered rules: **none** (50/50 mapped).

Non-numbered master sections lost entirely:

| Master file | Orphan section |
|-------------|----------------|
| `skills__professional-architecture-domain-isolation__SKILL.md` | `## Nx tooling that enforces these rules` (nx graph, enforce-module-boundaries, affected, generate, pnpm) |
| `skills__professional-architecture-platform-composition__SKILL.md` | `## How these rules reinforce each other` |
| `skills__professional-architecture-realtime-streaming__SKILL.md` | `## How rules 42, 45, and 47 interact` (+ mermaid diagram, page-refresh flow) |
| `skills__professional-architecture-testing-contracts__SKILL.md` | `## How they interact` (generated client + three tiers) |
