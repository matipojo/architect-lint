import type { IssueType } from './issue-types.js';

export const ISSUE_FAMILIES = [
  'testing',
  'maintainability',
  'security',
  'data-money',
  'structure',
  'api',
  'runtime',
  'ops',
] as const;

export type IssueFamily = (typeof ISSUE_FAMILIES)[number];

export interface IssueTypeCatalogEntry {
  id: IssueType;
  label: string;
  family: IssueFamily;
  /** One-sentence stake: what breaks if the rule is ignored. */
  definition: string;
  /** Tag when the failure matches these criteria. */
  useWhen: readonly string[];
  /** Do not use for these — common mis-tags. */
  notWhen: readonly string[];
  /** Real bullets from the catalog (abbreviated where long). */
  examples: readonly string[];
  /** Keyword patterns for auto-classification of untagged bullets. */
  classifyPatterns: readonly RegExp[];
  /** External taxonomies this stake aligns with. */
  externalRefs: readonly string[];
}

export const ISSUE_FAMILY_LABELS: Record<IssueFamily, string> = {
  testing: 'Testing & feedback',
  maintainability: 'Maintainability & navigation',
  security: 'Security & abuse',
  'data-money': 'Data integrity & cost',
  structure: 'Structure & coupling',
  api: 'API & contracts',
  runtime: 'Runtime, UX & scale',
  ops: 'Ops & governance',
};

/**
 * Canonical dictionary for "Why it matters" stake tags.
 *
 * Grounded in:
 * - OWASP Top 10 (Broken Access Control, Insecure Design, hardcoded secrets)
 * - Microservices antipattern catalogs (Cerny et al. 2023; Taibi et al.)
 * - Distributed failure modes (cascading failure, gray failure, blast radius)
 * - Test pyramid / contract testing literature
 */
export const ISSUE_TYPE_CATALOG: Record<IssueType, IssueTypeCatalogEntry> = {
  'double-charge': {
    id: 'double-charge',
    label: 'Double charge',
    family: 'data-money',
    definition:
      'The same user intent or payment triggers duplicate side effects — retries, double-clicks, or missing idempotency run work twice.',
    useWhen: [
      'Client retries or double-clicks create duplicate job runs or charges.',
      'Expensive operations (LLM calls, payments, provisioning) lack idempotency keys.',
      'Unreliable networks cause the same action to execute multiple times.',
    ],
    notWhen: [
      'Generic data inconsistency without duplicate execution (use data-corruption).',
      'Ongoing compute cost without duplicate runs (use wastes-money).',
    ],
    examples: [
      'Unreliable networks + client retries = duplicate runs of the same prompt = double charges.',
      'Skip idempotency on costly jobs — retries and double-clicks run the same work twice.',
    ],
    classifyPatterns: [
      /double charge|duplicate run|duplicate job|double-click|idempotency|same prompt|same user intent|run the same work twice/i,
    ],
    externalRefs: [
      'Idempotency keys (Stripe, HTTP PATCH semantics)',
      'Functional failure modes: duplicate execution',
    ],
  },

  'secret-exposure': {
    id: 'secret-exposure',
    label: 'Secret exposure',
    family: 'security',
    definition:
      'Credentials, tokens, or internal fields reach code, logs, client bundles, or error responses where they can be extracted.',
    useWhen: [
      'API keys, passwords, or tokens are hardcoded or logged in plain text.',
      'ORM entities or internal columns leak to API responses or the browser.',
      'Secrets appear in repo history, deployment scripts, or shared logs.',
    ],
    notWhen: [
      'Authorized user sees another tenant\'s data (use data-leak).',
      'Missing rate limits or CSRF (use abuse-vulnerable).',
    ],
    examples: [
      'Server code leaking to client = bloated bundle, or worse, secret leak.',
      'Return ORM entities from controllers — internal columns reach the client.',
    ],
    classifyPatterns: [
      /secret leak|secrets in code|passwords leak|passwordhash|internalnotes|internal field.*client|secret.*log|hardcoded secret|credential.*source|api key.*code/i,
    ],
    externalRefs: [
      'OWASP A02 Cryptographic Failures / hardcoded secrets (Cerny #42)',
      'CWE-798: Use of Hard-coded Credentials',
    ],
  },

  'data-leak': {
    id: 'data-leak',
    label: 'Data leak',
    family: 'security',
    definition:
      'A user or tenant accesses data they are not authorized to see — IDOR, missing tenant scope, or cross-org event delivery.',
    useWhen: [
      'Authorization trusts client-supplied IDs instead of server-side ownership checks.',
      'Tenant/org filters are missing on queries, rooms, caches, or storage paths.',
      'Flat resource names allow collision across tenants (rooms, object keys).',
    ],
    notWhen: [
      'Secrets in source code (use secret-exposure).',
      'Corrupted or orphan records (use data-corruption).',
      'DoS or brute force (use abuse-vulnerable).',
    ],
    examples: [
      'Authorizing on input = trusting the user. They can send another tenant\'s ID.',
      'Without namespacing, a name collision between orgs = a user receives another org\'s events.',
    ],
    classifyPatterns: [
      /another org|another tenant|cross-tenant|idor|data leak|sees another|receive.*another org|trust(ing)? the user|authorizing on input|name collision between orgs|forgotten filter.*org/i,
    ],
    externalRefs: [
      'OWASP A01 Broken Access Control / IDOR',
      'OWASP Multi-Tenant Security: cross-tenant data leakage',
    ],
  },

  'abuse-vulnerable': {
    id: 'abuse-vulnerable',
    label: 'Abuse vulnerable',
    family: 'security',
    definition:
      'The system can be abused at scale — brute force, DoS, CSRF, or expensive endpoints with no throttling.',
    useWhen: [
      'Login or token endpoints lack rate limiting.',
      'Expensive endpoints (LLM, reports) are open to intentional or accidental overload.',
      'State-changing browser actions lack CSRF protection.',
    ],
    notWhen: [
      'Data visible to wrong user (use data-leak).',
      'Cost from your own retries without attacker (use wastes-money or double-charge).',
    ],
    examples: [
      'Without rate limiting, the login endpoint is open to brute force.',
      'Expensive endpoints have no protection against intentional or accidental DoS.',
    ],
    classifyPatterns: [
      /brute force|\bdos\b|rate limit|csrf|throttl|intentional or accidental dos|abuse|noisy neighbor/i,
    ],
    externalRefs: [
      'OWASP Multi-Tenant: noisy neighbor attacks',
      'Microservices security antipatterns: missing throttling',
    ],
  },

  'data-corruption': {
    id: 'data-corruption',
    label: 'Data corruption',
    family: 'data-money',
    definition:
      'Data ends up wrong, partial, or inconsistent — orphaned records, divergent schemas, or lost writes.',
    useWhen: [
      'Multi-step writes can leave orphan or half-updated records.',
      'Duplicate type definitions diverge and cause silent field mismatches.',
      'Stream-only paths lose data that should have been persisted.',
    ],
    notWhen: [
      'Duplicate execution of the same paid job (use double-charge).',
      'User sees another tenant\'s row (use data-leak).',
    ],
    examples: [
      'If the second fails, an orphaned site is left in the DB.',
      'Two seemingly-identical types will diverge within 3 months — silent bug.',
    ],
    classifyPatterns: [
      /orphan|diverge within|ownerid on one side|silent bug|nothing persisted except|someone added ownerid|left in the db|half-updated|inconsistent state/i,
    ],
    externalRefs: [
      'Functional failure modes: value-related / timing-related failures',
      'ACID transaction boundaries',
    ],
  },

  'wastes-money': {
    id: 'wastes-money',
    label: 'Wastes money',
    family: 'data-money',
    definition:
      'Resources keep running after they are useless — LLM tokens after disconnect, memory holding unsent buffers, redundant verification.',
    useWhen: [
      'Downstream work continues after the client disconnected.',
      'Backpressure is missing and the server accumulates unsent responses.',
      'Per-request work repeats when a cheaper cached path exists.',
    ],
    notWhen: [
      'Duplicate charge for the same user action (use double-charge).',
      'Slow CI only (use slow-ci).',
    ],
    examples: [
      'Without cancellation, you pay for a response no one reads. At scale this is real money.',
      'Without backpressure, the server accumulates unsent responses and explodes on memory.',
    ],
    classifyPatterns: [
      /real money|pay for a response|double charges on expensive|jwt verify on every|expensive at chat|accumulates unsent|no one reads|pay for|wastes.*token|downstream work keeps running/i,
    ],
    externalRefs: [
      'Load shedding / cancellation in streaming systems',
      'Cost-aware LLM serving',
    ],
  },

  'slow-ci': {
    id: 'slow-ci',
    label: 'Slow CI',
    family: 'testing',
    definition:
      'Feedback loops are too long — every PR runs the full suite or e2e dominates so `nx affected` cannot skip work.',
    useWhen: [
      'CI takes 40+ minutes because everything is e2e.',
      'Contract or unit tiers are missing so every DTO change runs browser tests.',
      'Domain tests boot the whole platform when a slice would suffice.',
    ],
    notWhen: [
      'A red test does not say which layer broke (use unclear-failure).',
      'Cannot unit-test one class (use hard-to-test).',
    ],
    examples: [
      'If everything is e2e, CI takes 40 minutes and rule 2 (`nx affected`) doesn\'t help.',
      'CI runs every test on every PR — feedback loops stretch to 40+ minutes.',
    ],
    classifyPatterns: [
      /40 min|40\+ min|ci takes|feedback loop|nx affected.*can't skip|every test on every pr|affected.*doesn't help|runs every test|ci minutes climb|domain tests boot the whole platform/i,
    ],
    externalRefs: [
      'Test pyramid: over-reliance on e2e',
      'Microservices: expensive integration test suites',
    ],
  },

  'hard-to-test': {
    id: 'hard-to-test',
    label: 'Hard to test',
    family: 'testing',
    definition:
      'A behavior cannot be verified in isolation — needs live sockets, full app shell, real env vars, or entire backend fakes.',
    useWhen: [
      'Services read `process.env` directly instead of injected config.',
      'UI components need full context/backend to render in Storybook.',
      'Business logic is trapped in gateways or transport-only layers.',
    ],
    notWhen: [
      'CI is slow but tests do run (use slow-ci).',
      'Failure message is vague (use unclear-failure).',
      'Coding agents cannot find where to edit (use agent-gets-lost).',
    ],
    examples: [
      'A service that reads `process.env` directly is not testable — you can\'t fake configuration.',
      'UI mixed with fetch in one lib — Storybook needs the whole backend faked to render a card.',
    ],
    classifyPatterns: [
      /not testable|storybook|zero mocks|mock.*repository|synthetic config|stubbing.*process\.env|fake configuration|without a socket|tests receive config as a prop|can't fake|debugging and tests|can't hit it with http tests|can't render alone/i,
    ],
    externalRefs: [
      'Testability as an architectural quality attribute',
      'Dependency injection for configuration',
    ],
  },

  'unclear-failure': {
    id: 'unclear-failure',
    label: 'Unclear failure',
    family: 'testing',
    definition:
      'When something breaks, the signal does not identify the failing layer — logic, wiring, contract, or infra look the same in red CI.',
    useWhen: [
      'One failing e2e could be frontend, API, or DB and takes hours to bisect.',
      'Generic 500s do not distinguish bad input from bugs.',
      'Shared test setup fails and every domain goes red without a clear owner.',
    ],
    notWhen: [
      'Production logs cannot answer "which domain?" (use blind-in-prod).',
      'Tests are slow but failures are localized (use slow-ci).',
    ],
    examples: [
      'One red e2e — is it logic, wiring, or API? Hours split across layers before anyone knows.',
      'Generic 500 in two different cases = inability to distinguish a bug from bad input.',
    ],
    classifyPatterns: [
      /doesn't tell you|where the bug is|logic, wiring|whether logic|can't distinguish|failing test doesn't|clear who broke what|hours split across layers|every domain is red until someone finds/i,
    ],
    externalRefs: [
      'Gray failure: observers disagree (applied to test signals)',
      'Differential observability in CI',
    ],
  },

  'agent-gets-lost': {
    id: 'agent-gets-lost',
    label: 'Agent gets lost',
    family: 'maintainability',
    definition:
      'A coding agent or new teammate cannot find the correct layer, module, or edit boundary — logic is scattered, boundaries are fake, or ownership is ambiguous.',
    useWhen: [
      'UI, API, and domain rules live in one lib with no clear place for a change.',
      'Permissions, flags, or auth paths are scattered and require repo-wide grep.',
      'Boundaries exist on paper but imports or runtime coupling silently break them.',
      'Multiple sources of truth (spec, types, runtime) and nobody knows which to trust.',
    ],
    notWhen: [
      'Staging vs prod needs different code (use hard-to-change).',
      'Production incident with no logs (use blind-in-prod).',
      'LLM product "agent" UX (tool spinners) — use bad-ux unless the issue is edit-boundary confusion.',
      'Security IDOR or tenant leak (use data-leak).',
      'Slow CI (use slow-ci).',
    ],
    examples: [
      'One lib owns UI, API, and rules — agents can\'t tell which layer a change belongs in.',
      'Decorators scatter permissions across dozens of places. A policy change = grep across the project.',
      'Response shape lives in someone\'s head — backend adds a field, frontend finds out in prod.',
    ],
    classifyPatterns: [
      /agents can't tell|grep across|scatter|nobody remembers which|decoration|theory\. in practice|can't swap auth|permission.*decorator|one lib owns|which layer|response shape lives|types maintained twice|maintained twice.*disagree|enforce-module-boundaries can't|platform graph grows unreadable|long-lived feature branch|scattered feature if|merge bottleneck|ping-pong the incident|no boundary to assign|shared libs become merge/i,
    ],
    externalRefs: [
      'Microservices: team topology & unclear service boundaries',
      'Cognitive load / change amplification (maintainability antipatterns)',
    ],
  },

  'hard-to-change': {
    id: 'hard-to-change',
    label: 'Hard to change',
    family: 'maintainability',
    definition:
      'A small desired change forces a wide blast radius — env-specific code edits, cross-team coordination, or touching unrelated modules.',
    useWhen: [
      'Staging and prod differ only by editing code or duplicating modules.',
      'Adding OAuth requires editing one mega-Strategy full of conditionals.',
      'Public library changes need cross-team migration with no version path.',
      'New host or context requires editing a "shared" lib owned by the last embedder.',
    ],
    notWhen: [
      'Cannot find where to edit at all (use agent-gets-lost).',
      'Breaking consumers without versioning (use breaking-change).',
      'Cannot roll back one domain (use cant-rollback).',
    ],
    examples: [
      'Hard-coded module config — staging and prod need code edits or duplicate modules to differ.',
      'Without versioning, every change becomes a cross-team coordination project.',
      'One mega-Strategy with if/else per auth method — adding OAuth risks breaking JWT login.',
    ],
    classifyPatterns: [
      /staging and prod|environments differ|code edits or duplicate|duplicate modules|can't swap|can't add a new auth|without risking the existing|slips by a month|coordination project|touching every permission|evolve independently|without touching `shared`|policy change = grep|cross-team coordination|new host needs a lib edit|hard-coded module config|different configs in different environments/i,
    ],
    externalRefs: [
      'O\'Reilly: Static Contract Pitfall',
      'Environment configuration antipatterns (Cerny: Environment Configuration)',
      'Technical debt: change amplification',
    ],
  },

  'safe-to-delete': {
    id: 'safe-to-delete',
    label: 'Unsafe to delete',
    family: 'maintainability',
    definition:
      'Nobody can tell whether code, flags, or branches are dead — deleting feels dangerous so cruft accumulates.',
    useWhen: [
      'Dozens of feature `if`s with no registry of active flags.',
      'Long-lived branches or flags outlive their rollout.',
      'Shared components accumulate host-specific conditionals.',
    ],
    notWhen: [
      'Change is hard but code is clearly live (use hard-to-change).',
      'Missing ownership on a domain (use no-ownership).',
    ],
    examples: [
      'Without this, in a year you have 40 `if`s in one component and nobody knows what\'s safe to delete.',
      'Scattered feature ifs — nobody knows which flags are dead code safe to delete.',
    ],
    classifyPatterns: [
      /safe to delete|nobody knows what's safe|40 \`if|dead code|dead flag|which flags are/i,
    ],
    externalRefs: [
      'Feature flag hygiene',
      'Code rot / speculative generality',
    ],
  },

  'hidden-coupling': {
    id: 'hidden-coupling',
    label: 'Hidden coupling',
    family: 'structure',
    definition:
      'Module A depends on B\'s internals — private schema, job shape, repository, or global state — so refactors become surprise outages.',
    useWhen: [
      'One domain pushes jobs onto another domain\'s queue knowing internal payload shape.',
      'Controllers or foreign domains reach past the service into a repository.',
      'Shared libs import domain code and stop being shared.',
    ],
    notWhen: [
      'Failure visibly spreads at runtime (use spreads-failure).',
      'Public API changes break consumers (use api-drift or breaking-change).',
      'Layer responsibilities mixed in one class (use layer-mixing).',
    ],
    examples: [
      'Push a job onto another domain\'s queue — you depend on their internal job shape and renames.',
      'Import from another domain\'s internals — their refactor becomes your production outage.',
    ],
    classifyPatterns: [
      /hidden coupling|knows the catalog's internal|internal job structure|shared.*knows|not shared anymore|reach past|reach into|bypasses every|internal changes must not break|injected a column|global state.*untraceable|once `shared` knows|decorator gets the user but not the resource|knows about the db|foreign repository/i,
    ],
    externalRefs: [
      'Microservices: Reach-in Reporting AntiPattern (O\'Reilly)',
      'Connascence / inappropriate intimacy',
    ],
  },

  'spreads-failure': {
    id: 'spreads-failure',
    label: 'Spreads failure',
    family: 'structure',
    definition:
      'A fault in one component degrades unrelated parts — blast radius exceeds the owning domain or widget.',
    useWhen: [
      'One widget error blanks the entire shell or sidebar.',
      'Fixing one domain bug requires booting every app.',
      'Shared libs drag all consumers down together.',
    ],
    notWhen: [
      'Hidden dependency on internals without immediate outage (use hidden-coupling).',
      'Cannot scale horizontally (use cant-scale).',
      'Incident spans teams because boundaries are unclear (may also tag agent-gets-lost for ownership confusion).',
    ],
    examples: [
      'Workspace widget throws — catalog screen goes blank because everything shares one shell.',
      'Fix one domain bug — boot every app and lib because nothing is isolated.',
    ],
    classifyPatterns: [
      /wipes the entire|whole system|take down|blast radius|monolith|multiple apps before|widget wipes|explode together|every lib drags the whole system|inverse mess of a monolith|40 micro-domains|break multiple apps|entire screen|goes blank because everything shares/i,
    ],
    externalRefs: [
      'Cascading failure / bulkhead isolation',
      'Failure modes: blast-radius propagation',
    ],
  },

  'cant-run-alone': {
    id: 'cant-run-alone',
    label: "Can't run alone",
    family: 'structure',
    definition:
      'A domain or module cannot boot, deploy, or test in isolation — it only works inside a monolith or empty lib shell.',
    useWhen: [
      'Domain code lives only in AppModule while libs stay empty.',
      'Tests or demos require the whole platform to start.',
      'Global state must be populated before the module loads.',
    ],
    notWhen: [
      'CI is slow but domain could run alone (use slow-ci).',
      'Deploy is monolithic (use cant-rollback).',
    ],
    examples: [
      'Domain code lives only in AppModule — libs are empty and the domain can\'t load elsewhere.',
      'Without this, rule 1 is empty words — if tests need the whole system, dependencies live in code.',
    ],
    classifyPatterns: [
      /run the app standalone|global state|populate state|illusion|empty — and rule 1|need the whole system|dependencies live in code|loaded into a different app|run isolated in tests|can't load elsewhere|libs are empty/i,
    ],
    externalRefs: [
      'Microservices: service autonomy',
      'Domain-driven design: bounded context deployability',
    ],
  },

  'layer-mixing': {
    id: 'layer-mixing',
    label: 'Layer mixing',
    family: 'structure',
    definition:
      'Responsibilities leak across layers — transport, application, domain, and persistence concerns share one class or call path.',
    useWhen: [
      'Controllers or guards contain business rules or DB transactions.',
      'Repositories open transaction boundaries that belong to use cases.',
      'Domain services read `process.env` or return ORM entities to HTTP.',
    ],
    notWhen: [
      'Cross-domain import of another module\'s repository (use hidden-coupling).',
      'Cannot test without socket (use hard-to-test).',
    ],
    examples: [
      'A transaction in a controller = the controller knows about the DB. Layer violation.',
      'A guard that contains business logic = logic hidden from the service.',
    ],
    classifyPatterns: [
      /transaction in a controller|transaction inside a repository|guard.*business logic|interceptor.*behavior|process\.env directly|orm entity|leak abstractions|over-posting|class-validator|controller knows about the db|repository knows too much|action at a distance|layer violation|logic hidden from the service/i,
    ],
    externalRefs: [
      'Hexagonal / clean architecture layer violations',
      'Microservices intra-service design antipatterns',
    ],
  },

  'api-drift': {
    id: 'api-drift',
    label: 'API drift',
    family: 'api',
    definition:
      'Documented or typed contracts diverge from runtime behavior — compile succeeds, browser or client fails.',
    useWhen: [
      'Hand-maintained OpenAPI rots the moment controllers change.',
      'Hand-written fetch strings are not checked against backend routes.',
      'Frontend types, spec, and controllers are three sources of truth.',
    ],
    notWhen: [
      'Intentional semver break with migration (use breaking-change).',
      'Internal module coupling (use hidden-coupling).',
    ],
    examples: [
      'Hand-written fetch strings — backend renames compile fine and fail in the user\'s browser.',
      'Three truths — controller, handwritten spec, frontend types — diverge on the first field rename.',
    ],
    classifyPatterns: [
      /hand-maintained spec|hand-maintained openapi|wrong docs|openapi.*drift|generated client|response shape|compile, not the runtime|what fields\?|maintain types twice|entity directly|db schema|spec doesn't match|frontend client codegen|hand-written fetch|runtime errors/i,
    ],
    externalRefs: [
      'O\'Reilly: Static Contract Pitfall',
      'Consumer-driven contract testing',
    ],
  },

  'breaking-change': {
    id: 'breaking-change',
    label: 'Breaking change',
    family: 'api',
    definition:
      'A public library or API changes incompatibly without version bump, deprecation window, or migration path.',
    useWhen: [
      'Shared data-access lib changes shape and all consumers break silently.',
      'No semver or compatibility policy on published libs.',
    ],
    notWhen: [
      'Drift between spec and code without a published contract (use api-drift).',
      'Coordination cost of any change (use hard-to-change).',
    ],
    examples: [
      'Breaking change to data-access without a version — consumers break with no migration path.',
      'Next week — breaking change, no warning.',
    ],
    classifyPatterns: [
      /breaking change|no versioning|no warning|cross-team coordination.*version|consumers break with no migration|without a version/i,
    ],
    externalRefs: [
      'Semantic versioning',
      'Microservices: contract versioning antipatterns',
    ],
  },

  'drops-connection': {
    id: 'drops-connection',
    label: 'Drops connection',
    family: 'runtime',
    definition:
      'Long-lived connections fail silently or late — missing heartbeats, boot validation, or resume semantics.',
    useWhen: [
      'Missing env vars crash an hour after deploy instead of at boot.',
      'SSE/WebSocket clients think they are connected behind proxies without keep-alive.',
      'Stream resume fails across instances or after refresh.',
    ],
    notWhen: [
      'Client disconnected but server keeps spending (use wastes-money).',
      'Cannot scale sockets (use cant-scale).',
    ],
    examples: [
      'Validation at boot means the app won\'t start if a var is missing.',
      'When the client disconnected — downstream work keeps running.',
    ],
    classifyPatterns: [
      /idle connection|proxy timeout|keep-alive|heartbeats keep|client thinks it's connected|doesn't boot|crashing an hour later|validation at startup|validation at boot|resume after refresh|last-event-id|event ids for|resource leak|missing key crashes prod an hour after deploy/i,
    ],
    externalRefs: [
      'Distributed failure modes: omission / timeout',
      'SSE Last-Event-ID resume semantics',
    ],
  },

  'bad-ux': {
    id: 'bad-ux',
    label: 'Bad UX',
    family: 'runtime',
    definition:
      'Users lose state, see wrong feedback, or cannot tell progress — especially in streaming, multi-device, or async flows.',
    useWhen: [
      'Close tab and partial LLM output is gone forever.',
      'UI cannot show tool-call spinners or errors from unstructured streams.',
      'Multi-device sessions show different partial results.',
    ],
    notWhen: [
      'Analytics cannot parse logs (may be agent-gets-lost for operability, or blind-in-prod for prod).',
      'Data persisted wrong (use data-corruption).',
    ],
    examples: [
      'Stream-only output — close the tab and the partial response is gone forever.',
      'UI can\'t show tool-call spinners or error states from a plain text stream.',
    ],
    classifyPatterns: [
      /ui shows|spinner|tab closes|where it stopped|two devices|tool-call spinner|searching the site|error states from a plain text|history, debugging, and a record|partial response is gone|phone and laptop show different/i,
    ],
    externalRefs: [
      'Streaming UX patterns for LLM products',
      'User-perceived availability',
    ],
  },

  'cant-scale': {
    id: 'cant-scale',
    label: "Can't scale",
    family: 'runtime',
    definition:
      'Design assumes one instance — in-memory rooms, missing Redis adapter, sticky sessions, or wrong transport for fan-out.',
    useWhen: [
      'WebSocket rooms only reach clients on the same process.',
      'SSE buffers are in-memory and resume lands on the wrong node.',
      'One-way LLM streaming uses WebSocket plus sticky sessions unnecessarily.',
    ],
    notWhen: [
      'Cost at scale without horizontal scaling blocker (use wastes-money).',
      'DoS from abuse (use abuse-vulnerable).',
    ],
    examples: [
      'Ship single-instance sockets to prod — scaling out becomes a fire drill under load.',
      'WebSocket is operationally more expensive (sticky sessions, scaling, connections that don\'t close).',
    ],
    classifyPatterns: [
      /sticky session|redis adapter|instance 1.*instance 2|in-memory streams|room broadcast|sse stream resume|websocket is operationally|connections that don't close|http\/2.*proxies|load balancers treat|going to production needs this on day one|single-instance|same process|different instance than the original/i,
    ],
    externalRefs: [
      'Microservices: instance management & environment configuration faults',
      'Horizontal scaling for WebSocket/SSE',
    ],
  },

  'no-ownership': {
    id: 'no-ownership',
    label: 'No ownership',
    family: 'ops',
    definition:
      'No named owner, CODEOWNERS path, or README — cross-domain edits merge without the team that will be paged.',
    useWhen: [
      'New domains appear without owners, tags, or boundary READMEs.',
      'Shared paths change at midnight with no platform review.',
      'Business capability vs feature lib distinction is unclear.',
    ],
    notWhen: [
      'Cannot find code to edit (use agent-gets-lost).',
      'Logs lack domain dimension (use blind-in-prod).',
    ],
    examples: [
      'Without CODEOWNERS, boundary rules are comments — cross-domain PRs merge unnoticed.',
      'If you can\'t write a short clear README, the domain isn\'t well-defined.',
    ],
    classifyPatterns: [
      /codeowners|readme is the entry|well-defined|named owner|friction|paged|domain-scoped owners|platform lead|cannot be bypassed in review|without owners|business capability, not a feature|kind of a widget|new domains appear without owners|env vars scattered in services/i,
    ],
    externalRefs: [
      'Team Topologies / ownership boundaries',
      'Microservices: team organization antipatterns',
    ],
  },

  'blind-in-prod': {
    id: 'blind-in-prod',
    label: 'Blind in prod',
    family: 'ops',
    definition:
      'During an incident you cannot answer where, what domain, or which tenant — logs and metrics lack structure or correlation.',
    useWhen: [
      'First question is "which domain?" and logs cannot answer.',
      'Five ad-hoc log formats make search useless.',
      'No standard observability fields across modules.',
    ],
    notWhen: [
      'Test failure is ambiguous (use unclear-failure).',
      'Coding agents cannot navigate repo (use agent-gets-lost).',
    ],
    examples: [
      'When something breaks, the first question is "which domain?" If the logs don\'t know — you\'re blind.',
      'Without a standard, you end up with five log formats and can\'t search anything.',
    ],
    classifyPatterns: [
      /which domain\?|logs don't know|you're blind|can't search anything|without a standard|first question is "which domain|five log formats|incident.*blind/i,
    ],
    externalRefs: [
      'Gray failure: differential observability (Microsoft Research HotOS \'17)',
      'SRE: observability-driven incident response',
    ],
  },

  'cant-rollback': {
    id: 'cant-rollback',
    label: "Can't rollback",
    family: 'ops',
    definition:
      'Deploy units are too coarse — one bad change forces rolling back everything or hotfixing forward under pressure.',
    useWhen: [
      'Monolithic deploy ties all domains to one release train.',
      'Per-domain rollback is required but architecture prevents it.',
    ],
    notWhen: [
      'Change is hard but deploy could be reverted independently (use hard-to-change).',
      'Failure spreads at runtime before deploy (use spreads-failure).',
    ],
    examples: [
      'Per-domain rollback is critical when something breaks in production.',
      'If deploy is monolithic, rule 1 (domain separation) is theory. In practice you have one app.',
    ],
    classifyPatterns: [
      /per-domain rollback|deploy is monolithic|monolithic deploy|deploy without release|can't rollback|single release train|one app in practice/i,
    ],
    externalRefs: [
      'Continuous delivery: deploy independence',
      'Microservices: team organization & release autonomy',
    ],
  },
};

export const ISSUE_TYPES_BY_FAMILY: Record<IssueFamily, IssueType[]> = ISSUE_FAMILIES.reduce(
  (acc, family) => {
    acc[family] = (Object.values(ISSUE_TYPE_CATALOG) as IssueTypeCatalogEntry[])
      .filter((entry) => entry.family === family)
      .map((entry) => entry.id);
    return acc;
  },
  {} as Record<IssueFamily, IssueType[]>,
);

export function issueTypeFamily(type: IssueType): IssueFamily {
  return ISSUE_TYPE_CATALOG[type].family;
}

export function catalogClassifyPatterns(): Array<{ type: IssueType; patterns: RegExp[] }> {
  return (Object.values(ISSUE_TYPE_CATALOG) as IssueTypeCatalogEntry[]).map((entry) => ({
    type: entry.id,
    patterns: [...entry.classifyPatterns],
  }));
}
