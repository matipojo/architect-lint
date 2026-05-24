/**
 * Rewrite "Why it matters" bullets that describe benefits into failure modes.
 * Run: tsx scripts/migrate/rewrite-why-failures.ts
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalogRoot } from '../../packages/codegen/catalog-meta.js';
import { classifyIssueText, formatWhyBullet, type Issue } from '../../packages/codegen/parse-rule-issues.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const CATALOG = join(ROOT, catalogRoot());

const REWRITES: Record<string, string> = {
  'Each strategy answers exactly one question: "who is the user on this request?"':
    'One mega-Strategy with if/else per auth method — adding OAuth risks breaking JWT login.',
  'The same permission needs to apply both in the UI (hide a button) and in the backend. One policy = two consumers.':
    'Permission duplicated in a decorator and a UI if — update one, forget the other, ship a hole.',
  'Events are how domains coordinate without one knowing the other\'s internals.':
    'Push a job onto another domain\'s queue — you now depend on their internal job shape and renames.',
  'Lets the same module run with different configs in different environments without code changes.':
    'Hard-coded module config — staging and prod need code edits or duplicate modules to differ.',
  'Lets tests assemble the module with synthetic config.':
    'Config baked into the module — tests reach for process.env instead of injecting values.',
  'One source of truth: the controller + DTO. Frontend, docs, and tests consume the same spec.':
    'Three truths — controller, handwritten spec, frontend types — diverge on the first field rename.',
  'The repository is internal to the domain. The service is the public API.':
    'Import another domain\'s repository — you skip their service and its validation entirely.',
  'The service is where validation, authorization, and logging are enforced.':
    'Reach past the service into a foreign repository — auth and validation never run.',
  'DTOs give you `class-validator` validation and protection from over-posting.':
    'Return ORM entities from controllers — over-posting and internal columns reach the client.',
  'This is the industry standard idempotency pattern. For expensive long-running jobs — mandatory.':
    'Skip idempotency on costly jobs — retries and double-clicks run the same work twice.',
  'Typed events feed logging, analytics, and debugging — from the same stream.':
    'Unstructured token stream — logs and analytics can\'t tell tool calls from text deltas.',
  'Same problem as multi-tenancy in the DB, but on the real-time channel.':
    'Flat room names like `doc-123` — same ID collision leaks events across tenants.',
  'Every real-time system going to production needs this on day one, or it will hurt later.':
    'Ship single-instance sockets to prod — scaling out becomes a fire drill under load.',
  'SSE resume across instances also needs a shared broker — in-memory streams can\'t hand off to another node.':
    'In-memory SSE buffers — resume lands on another node and the stream starts over or 404s.',
  'For LLM response streaming — SSE wins big: works through HTTP/2, through proxies, with regular infrastructure.':
    'Default to WebSocket for one-way LLM tokens — sticky sessions and socket ops you don\'t need.',
  'The gateway is transport, not business logic. It receives a message, authorizes, hands off to a service.':
    'Business logic in the gateway — can\'t hit it with HTTP tests or reuse it outside WebSockets.',
  'An endpoint change breaks the compile, not the runtime.':
    'Hand-written fetch strings — backend renames compile fine and fail in the user\'s browser.',
  'No more "what\'s the response shape?" — the type is guaranteed.':
    'Response shape lives in someone\'s head — backend adds a field, frontend finds out in prod.',
  'Removes the need to maintain types twice (see also `professional-architecture-monorepo-hygiene` rule 13).':
    'Types maintained twice — OpenAPI, hand types, and runtime behavior disagree within a sprint.',
  'Dev speed — don\'t load the whole system to fix one bug.':
    'Fix one domain bug — boot every app and lib because nothing is isolated.',
  'Blast radius — a bug in the workspace domain doesn\'t take down catalog.':
    'Workspace widget throws — catalog screen goes blank because everything shares one shell.',
  'Clear ownership — every domain has a boundary you can point at.':
    'Failure spans domains — no boundary to assign, two teams ping-pong the incident.',
  'Teams work in parallel without trampling each other.':
    'Shared libs become merge bottlenecks — every feature waits on the same conflict queue.',
  'Internal changes must not break consumers — if they do, you have hidden coupling.':
    'Import from another domain\'s internals — their refactor becomes your production outage.',
  'The public API is the only surface that needs strict review.':
    'Every export is public — rename an internal helper, break three consumers silently.',
  'Pure UI lib runs in Storybook with zero mocks.':
    'UI mixed with fetch in one lib — Storybook needs the whole backend faked to render a card.',
  'data-access lib can be replaced with a mock in one shot.':
    'API calls inside UI components — swapping the backend means rewriting components, not one mock.',
  'feature is the only lib that knows both — and is the only one that composes.':
    'One lib owns UI, API, and rules — agents can\'t tell which layer a change belongs in.',
  'This is what lets you add a new domain without touching `shared`.':
    'shared imports a domain — every new app drags another edit through platform review.',
  'Turns architectural boundaries from suggestion into process — cannot be bypassed in review.':
    'Without CODEOWNERS, boundary rules are comments — cross-domain PRs merge unnoticed.',
  'Shared code changes get platform-lead eyes before they land.':
    'Midnight tweak to shared/ — no platform review, multiple apps red before standup.',
  'With Zod or similar, the same schema gives you runtime validation and a compile-time type.':
    'Same type written twice — one side adds a field, the other doesn\'t, silent production bug.',
  'Tiers tell you where the bug is: unit fails → logic. integration fails → wiring. e2e fails → contract.':
    'One red e2e — is it logic, wiring, or API? Hours split across layers before anyone knows.',
  'A generated client gives e2e tests a typed surface; the three-tier split keeps contract test cost low.':
    'Contract checks only in browser e2e — every DTO tweak runs the full 40-minute suite.',
  'Composition is what enables reuse without "variants". One component, assembled differently.':
    'Context inheritance — component can\'t render in Storybook without faking half the app shell.',
  'New context = compose different props. Don\'t touch the lib.':
    'New host needs a lib edit — the "shared" component is now owned by whoever embedded it last.',
  'Enables deploy without release.':
    'No feature flags — every partial feature waits for a coordinated release train.',
  'Prevents long-lived branches that drift from the system.':
    'Long-lived feature branches — merge conflicts and drift until nobody trusts main.',
  'Replaces the scattered `if (isNewFeatureEnabled)` with a single, defined source.':
    'Scattered feature ifs — nobody knows which flags are dead code safe to delete.',
  'Versioning is what lets domains evolve independently.':
    'Breaking change to data-access without a version — consumers break with no migration path.',
  'A standalone module can be loaded into a different app, or run isolated in tests.':
    'Domain code lives only in AppModule — libs are empty and the domain can\'t load elsewhere.',
  'The user closes the tab mid-response and re-opens — you need to show where it stopped.':
    'Stream-only output — close the tab and the partial response is gone forever.',
  'You need history, debugging, and a record of what you paid for.':
    'Nothing persisted per run — can\'t audit LLM spend or debug what the user actually saw.',
  'Two devices of the same user need to see the same run.':
    'Run state only in browser memory — phone and laptop show different partial streams.',
  'LLM streaming has long pauses between tokens (tool calls). Heartbeats keep the connection alive.':
    'Long tool-call gaps with no keep-alive — proxy closes the stream while UI still says "streaming".',
  'CI times stay sane as the system grows.':
    'Domain tests boot the whole platform — CI minutes climb with every new app added.',
  'When a test fails, it\'s clear who broke what.':
    'Shared test setup fails — every domain is red until someone finds the one bad import.',
  'No surprises. All settings in one reviewable place.':
    'Env vars scattered in services — missing key crashes prod an hour after deploy, not at boot.',
};

const SUMMARY_REWRITES: Record<string, string> = {
  'Pure UI lib runs in Storybook with zero mocks.':
    'Mix UI with API in one lib — Storybook needs the whole stack mocked.',
  'Lets the same module run with different configs in different environments without code changes.':
    'Hard-coded module config — environments differ only by editing code.',
  'Enables deploy without release.':
    'Without flags, every deploy waits on a coordinated release.',
  'A standalone module can be loaded into a different app, or run isolated in tests.':
    'Domain logic trapped in AppModule — libs stay empty shells.',
  'An endpoint change breaks the compile, not the runtime.':
    'Hand-written fetch — API changes fail in the browser, not at compile time.',
};

function findRuleFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findRuleFiles(full));
    } else if (entry.endsWith('.rule.md')) {
      results.push(full);
    }
  }
  return results;
}

function rewriteWhySection(content: string): { updated: string; changed: boolean } {
  const match = content.match(/## Why it matters\n\n([\s\S]*?)(?=\n## |\s*$)/);
  if (!match) return { updated: content, changed: false };

  let changed = false;
  const lines = match[1].split('\n').map((rawLine) => {
    if (!rawLine.trim().startsWith('-')) return rawLine;

    const tagged = rawLine.trim().match(/^-\s*\[([a-z][a-z0-9-]*)\]\s+(.+)$/);
    const text = tagged?.[2] ?? rawLine.trim().replace(/^-\s*/, '');
    const replacement = REWRITES[text];
    if (!replacement) return rawLine;

    const type = tagged?.[1] ?? classifyIssueText(replacement);
    const line = formatWhyBullet({ type, text: replacement } as Issue);
    if (rawLine.trim() !== line) changed = true;
    return line;
  });

  if (!changed) return { updated: content, changed: false };

  const newSection = `## Why it matters\n\n${lines.join('\n')}`;
  return {
    updated: content.replace(match[0], newSection),
    changed: true,
  };
}

function rewriteSummary(content: string): { updated: string; changed: boolean } {
  const match = content.match(/^(# .+\n\n)([\s\S]*?)(\n## Why it matters)/m);
  if (!match) return { updated: content, changed: false };

  const summary = match[2].trim();
  const replacement = SUMMARY_REWRITES[summary];
  if (!replacement) return { updated: content, changed: false };

  return {
    updated: content.replace(match[0], `${match[1]}${replacement}\n\n${match[3]}`),
    changed: true,
  };
}

function main() {
  const files = findRuleFiles(CATALOG).sort();
  console.log(`Rewriting benefit bullets in ${files.length} rules...`);
  let changed = 0;

  for (const file of files) {
    let source = readFileSync(file, 'utf8');
    const why = rewriteWhySection(source);
    source = why.updated;
    const summary = rewriteSummary(source);
    source = summary.updated;

    if (!why.changed && !summary.changed) continue;
    writeFileSync(file, source);
    changed++;
    console.log(`  ✓ ${file.replace(`${CATALOG}/`, '')}`);
  }

  console.log(`Done. Updated ${changed} files.`);
}

main();
