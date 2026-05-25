# Issue type catalog

Dictionary for **Why it matters** stake tags on principle records.

**Source of truth:** `packages/codegen/issue-type-catalog.ts` (this file is generated — do not hand-edit).

Each bullet names a **failure mode** if the rule is ignored — not the benefit of following it.

## Families

### Testing & feedback

`slow-ci`, `hard-to-test`, `unclear-failure`

### Maintainability & navigation

`agent-gets-lost`, `hard-to-change`, `safe-to-delete`

### Security & abuse

`secret-exposure`, `data-leak`, `abuse-vulnerable`

### Data integrity & cost

`double-charge`, `data-corruption`, `wastes-money`

### Structure & coupling

`hidden-coupling`, `spreads-failure`, `cant-run-alone`, `layer-mixing`

### API & contracts

`api-drift`, `breaking-change`

### Runtime, UX & scale

`drops-connection`, `bad-ux`, `cant-scale`

### Ops & governance

`no-ownership`, `blind-in-prod`, `cant-rollback`

## External references

Tags align with stakes found in:

- OWASP Top 10 (Broken Access Control, Insecure Design, hardcoded secrets, multi-tenant isolation)
- Microservices antipattern catalogs (Cerny et al. 2023; Taibi et al.; O'Reilly pitfalls)
- Distributed failure modes (cascading failure, gray failure, blast radius, omission/timeouts)
- Test pyramid, contract testing, and deploy independence

## Tag dictionary

## Testing & feedback

### `slow-ci` — Slow CI

Feedback loops are too long — every PR runs the full suite or e2e dominates so `nx affected` cannot skip work.

**Use when**

- CI takes 40+ minutes because everything is e2e.
- Contract or unit tiers are missing so every DTO change runs browser tests.
- Domain tests boot the whole platform when a slice would suffice.

**Not when**

- A red test does not say which layer broke (use unclear-failure).
- Cannot unit-test one class (use hard-to-test).

**Examples from catalog**

- If everything is e2e, CI takes 40 minutes and rule 2 (`nx affected`) doesn't help.
- CI runs every test on every PR — feedback loops stretch to 40+ minutes.

**See also**

- Test pyramid: over-reliance on e2e
- Microservices: expensive integration test suites

### `hard-to-test` — Hard to test

A behavior cannot be verified in isolation — needs live sockets, full app shell, real env vars, or entire backend fakes.

**Use when**

- Services read `process.env` directly instead of injected config.
- UI components need full context/backend to render in Storybook.
- Business logic is trapped in gateways or transport-only layers.

**Not when**

- CI is slow but tests do run (use slow-ci).
- Failure message is vague (use unclear-failure).
- Coding agents cannot find where to edit (use agent-gets-lost).

**Examples from catalog**

- A service that reads `process.env` directly is not testable — you can't fake configuration.
- UI mixed with fetch in one lib — Storybook needs the whole backend faked to render a card.

**See also**

- Testability as an architectural quality attribute
- Dependency injection for configuration

### `unclear-failure` — Unclear failure

When something breaks, the signal does not identify the failing layer — logic, wiring, contract, or infra look the same in red CI.

**Use when**

- One failing e2e could be frontend, API, or DB and takes hours to bisect.
- Generic 500s do not distinguish bad input from bugs.
- Shared test setup fails and every domain goes red without a clear owner.

**Not when**

- Production logs cannot answer "which domain?" (use blind-in-prod).
- Tests are slow but failures are localized (use slow-ci).

**Examples from catalog**

- One red e2e — is it logic, wiring, or API? Hours split across layers before anyone knows.
- Generic 500 in two different cases = inability to distinguish a bug from bad input.

**See also**

- Gray failure: observers disagree (applied to test signals)
- Differential observability in CI

## Maintainability & navigation

### `agent-gets-lost` — Agent gets lost

A coding agent or new teammate cannot find the correct layer, module, or edit boundary — logic is scattered, boundaries are fake, or ownership is ambiguous.

**Use when**

- UI, API, and domain rules live in one lib with no clear place for a change.
- Permissions, flags, or auth paths are scattered and require repo-wide grep.
- Boundaries exist on paper but imports or runtime coupling silently break them.
- Multiple sources of truth (spec, types, runtime) and nobody knows which to trust.

**Not when**

- Staging vs prod needs different code (use hard-to-change).
- Production incident with no logs (use blind-in-prod).
- LLM product "agent" UX (tool spinners) — use bad-ux unless the issue is edit-boundary confusion.
- Security IDOR or tenant leak (use data-leak).
- Slow CI (use slow-ci).

**Examples from catalog**

- One lib owns UI, API, and rules — agents can't tell which layer a change belongs in.
- Decorators scatter permissions across dozens of places. A policy change = grep across the project.
- Response shape lives in someone's head — backend adds a field, frontend finds out in prod.

**See also**

- Microservices: team topology & unclear service boundaries
- Cognitive load / change amplification (maintainability antipatterns)

### `hard-to-change` — Hard to change

A small desired change forces a wide blast radius — env-specific code edits, cross-team coordination, or touching unrelated modules.

**Use when**

- Staging and prod differ only by editing code or duplicating modules.
- Adding OAuth requires editing one mega-Strategy full of conditionals.
- Public library changes need cross-team migration with no version path.
- New host or context requires editing a "shared" lib owned by the last embedder.

**Not when**

- Cannot find where to edit at all (use agent-gets-lost).
- Breaking consumers without versioning (use breaking-change).
- Cannot roll back one domain (use cant-rollback).

**Examples from catalog**

- Hard-coded module config — staging and prod need code edits or duplicate modules to differ.
- Without versioning, every change becomes a cross-team coordination project.
- One mega-Strategy with if/else per auth method — adding OAuth risks breaking JWT login.

**See also**

- O'Reilly: Static Contract Pitfall
- Environment configuration antipatterns (Cerny: Environment Configuration)
- Technical debt: change amplification

### `safe-to-delete` — Unsafe to delete

Nobody can tell whether code, flags, or branches are dead — deleting feels dangerous so cruft accumulates.

**Use when**

- Dozens of feature `if`s with no registry of active flags.
- Long-lived branches or flags outlive their rollout.
- Shared components accumulate host-specific conditionals.

**Not when**

- Change is hard but code is clearly live (use hard-to-change).
- Missing ownership on a domain (use no-ownership).

**Examples from catalog**

- Without this, in a year you have 40 `if`s in one component and nobody knows what's safe to delete.
- Scattered feature ifs — nobody knows which flags are dead code safe to delete.

**See also**

- Feature flag hygiene
- Code rot / speculative generality

## Security & abuse

### `secret-exposure` — Secret exposure

Credentials, tokens, or internal fields reach code, logs, client bundles, or error responses where they can be extracted.

**Use when**

- API keys, passwords, or tokens are hardcoded or logged in plain text.
- ORM entities or internal columns leak to API responses or the browser.
- Secrets appear in repo history, deployment scripts, or shared logs.

**Not when**

- Authorized user sees another tenant's data (use data-leak).
- Missing rate limits or CSRF (use abuse-vulnerable).

**Examples from catalog**

- Server code leaking to client = bloated bundle, or worse, secret leak.
- Return ORM entities from controllers — internal columns reach the client.

**See also**

- OWASP A02 Cryptographic Failures / hardcoded secrets (Cerny #42)
- CWE-798: Use of Hard-coded Credentials

### `data-leak` — Data leak

A user or tenant accesses data they are not authorized to see — IDOR, missing tenant scope, or cross-org event delivery.

**Use when**

- Authorization trusts client-supplied IDs instead of server-side ownership checks.
- Tenant/org filters are missing on queries, rooms, caches, or storage paths.
- Flat resource names allow collision across tenants (rooms, object keys).

**Not when**

- Secrets in source code (use secret-exposure).
- Corrupted or orphan records (use data-corruption).
- DoS or brute force (use abuse-vulnerable).

**Examples from catalog**

- Authorizing on input = trusting the user. They can send another tenant's ID.
- Without namespacing, a name collision between orgs = a user receives another org's events.

**See also**

- OWASP A01 Broken Access Control / IDOR
- OWASP Multi-Tenant Security: cross-tenant data leakage

### `abuse-vulnerable` — Abuse vulnerable

The system can be abused at scale — brute force, DoS, CSRF, or expensive endpoints with no throttling.

**Use when**

- Login or token endpoints lack rate limiting.
- Expensive endpoints (LLM, reports) are open to intentional or accidental overload.
- State-changing browser actions lack CSRF protection.

**Not when**

- Data visible to wrong user (use data-leak).
- Cost from your own retries without attacker (use wastes-money or double-charge).

**Examples from catalog**

- Without rate limiting, the login endpoint is open to brute force.
- Expensive endpoints have no protection against intentional or accidental DoS.

**See also**

- OWASP Multi-Tenant: noisy neighbor attacks
- Microservices security antipatterns: missing throttling

## Data integrity & cost

### `double-charge` — Double charge

The same user intent or payment triggers duplicate side effects — retries, double-clicks, or missing idempotency run work twice.

**Use when**

- Client retries or double-clicks create duplicate job runs or charges.
- Expensive operations (LLM calls, payments, provisioning) lack idempotency keys.
- Unreliable networks cause the same action to execute multiple times.

**Not when**

- Generic data inconsistency without duplicate execution (use data-corruption).
- Ongoing compute cost without duplicate runs (use wastes-money).

**Examples from catalog**

- Unreliable networks + client retries = duplicate runs of the same prompt = double charges.
- Skip idempotency on costly jobs — retries and double-clicks run the same work twice.

**See also**

- Idempotency keys (Stripe, HTTP PATCH semantics)
- Functional failure modes: duplicate execution

### `data-corruption` — Data corruption

Data ends up wrong, partial, or inconsistent — orphaned records, divergent schemas, or lost writes.

**Use when**

- Multi-step writes can leave orphan or half-updated records.
- Duplicate type definitions diverge and cause silent field mismatches.
- Stream-only paths lose data that should have been persisted.

**Not when**

- Duplicate execution of the same paid job (use double-charge).
- User sees another tenant's row (use data-leak).

**Examples from catalog**

- If the second fails, an orphaned site is left in the DB.
- Two seemingly-identical types will diverge within 3 months — silent bug.

**See also**

- Functional failure modes: value-related / timing-related failures
- ACID transaction boundaries

### `wastes-money` — Wastes money

Resources keep running after they are useless — LLM tokens after disconnect, memory holding unsent buffers, redundant verification.

**Use when**

- Downstream work continues after the client disconnected.
- Backpressure is missing and the server accumulates unsent responses.
- Per-request work repeats when a cheaper cached path exists.

**Not when**

- Duplicate charge for the same user action (use double-charge).
- Slow CI only (use slow-ci).

**Examples from catalog**

- Without cancellation, you pay for a response no one reads. At scale this is real money.
- Without backpressure, the server accumulates unsent responses and explodes on memory.

**See also**

- Load shedding / cancellation in streaming systems
- Cost-aware LLM serving

## Structure & coupling

### `hidden-coupling` — Hidden coupling

Module A depends on B's internals — private schema, job shape, repository, or global state — so refactors become surprise outages.

**Use when**

- One domain pushes jobs onto another domain's queue knowing internal payload shape.
- Controllers or foreign domains reach past the service into a repository.
- Shared libs import domain code and stop being shared.

**Not when**

- Failure visibly spreads at runtime (use spreads-failure).
- Public API changes break consumers (use api-drift or breaking-change).
- Layer responsibilities mixed in one class (use layer-mixing).

**Examples from catalog**

- Push a job onto another domain's queue — you depend on their internal job shape and renames.
- Import from another domain's internals — their refactor becomes your production outage.

**See also**

- Microservices: Reach-in Reporting AntiPattern (O'Reilly)
- Connascence / inappropriate intimacy

### `spreads-failure` — Spreads failure

A fault in one component degrades unrelated parts — blast radius exceeds the owning domain or widget.

**Use when**

- One widget error blanks the entire shell or sidebar.
- Fixing one domain bug requires booting every app.
- Shared libs drag all consumers down together.

**Not when**

- Hidden dependency on internals without immediate outage (use hidden-coupling).
- Cannot scale horizontally (use cant-scale).
- Incident spans teams because boundaries are unclear (may also tag agent-gets-lost for ownership confusion).

**Examples from catalog**

- Workspace widget throws — catalog screen goes blank because everything shares one shell.
- Fix one domain bug — boot every app and lib because nothing is isolated.

**See also**

- Cascading failure / bulkhead isolation
- Failure modes: blast-radius propagation

### `cant-run-alone` — Can't run alone

A domain or module cannot boot, deploy, or test in isolation — it only works inside a monolith or empty lib shell.

**Use when**

- Domain code lives only in AppModule while libs stay empty.
- Tests or demos require the whole platform to start.
- Global state must be populated before the module loads.

**Not when**

- CI is slow but domain could run alone (use slow-ci).
- Deploy is monolithic (use cant-rollback).

**Examples from catalog**

- Domain code lives only in AppModule — libs are empty and the domain can't load elsewhere.
- Without this, rule 1 is empty words — if tests need the whole system, dependencies live in code.

**See also**

- Microservices: service autonomy
- Domain-driven design: bounded context deployability

### `layer-mixing` — Layer mixing

Responsibilities leak across layers — transport, application, domain, and persistence concerns share one class or call path.

**Use when**

- Controllers or guards contain business rules or DB transactions.
- Repositories open transaction boundaries that belong to use cases.
- Domain services read `process.env` or return ORM entities to HTTP.

**Not when**

- Cross-domain import of another module's repository (use hidden-coupling).
- Cannot test without socket (use hard-to-test).

**Examples from catalog**

- A transaction in a controller = the controller knows about the DB. Layer violation.
- A guard that contains business logic = logic hidden from the service.

**See also**

- Hexagonal / clean architecture layer violations
- Microservices intra-service design antipatterns

## API & contracts

### `api-drift` — API drift

Documented or typed contracts diverge from runtime behavior — compile succeeds, browser or client fails.

**Use when**

- Hand-maintained OpenAPI rots the moment controllers change.
- Hand-written fetch strings are not checked against backend routes.
- Frontend types, spec, and controllers are three sources of truth.

**Not when**

- Intentional semver break with migration (use breaking-change).
- Internal module coupling (use hidden-coupling).

**Examples from catalog**

- Hand-written fetch strings — backend renames compile fine and fail in the user's browser.
- Three truths — controller, handwritten spec, frontend types — diverge on the first field rename.

**See also**

- O'Reilly: Static Contract Pitfall
- Consumer-driven contract testing

### `breaking-change` — Breaking change

A public library or API changes incompatibly without version bump, deprecation window, or migration path.

**Use when**

- Shared data-access lib changes shape and all consumers break silently.
- No semver or compatibility policy on published libs.

**Not when**

- Drift between spec and code without a published contract (use api-drift).
- Coordination cost of any change (use hard-to-change).

**Examples from catalog**

- Breaking change to data-access without a version — consumers break with no migration path.
- Next week — breaking change, no warning.

**See also**

- Semantic versioning
- Microservices: contract versioning antipatterns

## Runtime, UX & scale

### `drops-connection` — Drops connection

Long-lived connections fail silently or late — missing heartbeats, boot validation, or resume semantics.

**Use when**

- Missing env vars crash an hour after deploy instead of at boot.
- SSE/WebSocket clients think they are connected behind proxies without keep-alive.
- Stream resume fails across instances or after refresh.

**Not when**

- Client disconnected but server keeps spending (use wastes-money).
- Cannot scale sockets (use cant-scale).

**Examples from catalog**

- Validation at boot means the app won't start if a var is missing.
- When the client disconnected — downstream work keeps running.

**See also**

- Distributed failure modes: omission / timeout
- SSE Last-Event-ID resume semantics

### `bad-ux` — Bad UX

Users lose state, see wrong feedback, or cannot tell progress — especially in streaming, multi-device, or async flows.

**Use when**

- Close tab and partial LLM output is gone forever.
- UI cannot show tool-call spinners or errors from unstructured streams.
- Multi-device sessions show different partial results.

**Not when**

- Analytics cannot parse logs (may be agent-gets-lost for operability, or blind-in-prod for prod).
- Data persisted wrong (use data-corruption).

**Examples from catalog**

- Stream-only output — close the tab and the partial response is gone forever.
- UI can't show tool-call spinners or error states from a plain text stream.

**See also**

- Streaming UX patterns for LLM products
- User-perceived availability

### `cant-scale` — Can't scale

Design assumes one instance — in-memory rooms, missing Redis adapter, sticky sessions, or wrong transport for fan-out.

**Use when**

- WebSocket rooms only reach clients on the same process.
- SSE buffers are in-memory and resume lands on the wrong node.
- One-way LLM streaming uses WebSocket plus sticky sessions unnecessarily.

**Not when**

- Cost at scale without horizontal scaling blocker (use wastes-money).
- DoS from abuse (use abuse-vulnerable).

**Examples from catalog**

- Ship single-instance sockets to prod — scaling out becomes a fire drill under load.
- WebSocket is operationally more expensive (sticky sessions, scaling, connections that don't close).

**See also**

- Microservices: instance management & environment configuration faults
- Horizontal scaling for WebSocket/SSE

## Ops & governance

### `no-ownership` — No ownership

No named owner, CODEOWNERS path, or README — cross-domain edits merge without the team that will be paged.

**Use when**

- New domains appear without owners, tags, or boundary READMEs.
- Shared paths change at midnight with no platform review.
- Business capability vs feature lib distinction is unclear.

**Not when**

- Cannot find code to edit (use agent-gets-lost).
- Logs lack domain dimension (use blind-in-prod).

**Examples from catalog**

- Without CODEOWNERS, boundary rules are comments — cross-domain PRs merge unnoticed.
- If you can't write a short clear README, the domain isn't well-defined.

**See also**

- Team Topologies / ownership boundaries
- Microservices: team organization antipatterns

### `blind-in-prod` — Blind in prod

During an incident you cannot answer where, what domain, or which tenant — logs and metrics lack structure or correlation.

**Use when**

- First question is "which domain?" and logs cannot answer.
- Five ad-hoc log formats make search useless.
- No standard observability fields across modules.

**Not when**

- Test failure is ambiguous (use unclear-failure).
- Coding agents cannot navigate repo (use agent-gets-lost).

**Examples from catalog**

- When something breaks, the first question is "which domain?" If the logs don't know — you're blind.
- Without a standard, you end up with five log formats and can't search anything.

**See also**

- Gray failure: differential observability (Microsoft Research HotOS '17)
- SRE: observability-driven incident response

### `cant-rollback` — Can't rollback

Deploy units are too coarse — one bad change forces rolling back everything or hotfixing forward under pressure.

**Use when**

- Monolithic deploy ties all domains to one release train.
- Per-domain rollback is required but architecture prevents it.

**Not when**

- Change is hard but deploy could be reverted independently (use hard-to-change).
- Failure spreads at runtime before deploy (use spreads-failure).

**Examples from catalog**

- Per-domain rollback is critical when something breaks in production.
- If deploy is monolithic, rule 1 (domain separation) is theory. In practice you have one app.

**See also**

- Continuous delivery: deploy independence
- Microservices: team organization & release autonomy
