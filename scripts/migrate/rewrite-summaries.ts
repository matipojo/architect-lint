/**
 * Rewrite one-line summaries that duplicate Why-it-matters bullet 1 (or the title).
 * Summaries explain the rule; bullets keep the failure modes.
 * Run: tsx scripts/migrate/rewrite-summaries.ts
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalogRoot } from '../../packages/codegen/catalog-meta.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG = join(__dirname, '../..', catalogRoot());

const SUMMARY_BY_ID: Record<string, string> = {
  'nx-testing-three-tiers':
    'Three test tiers — unit, integration, e2e — so CI stays fast and a red test names the broken layer.',
  'nestjs-auth-policies-not-decorators':
    'Authorization lives in testable policy functions — not scattered `@RequireRole` decorators on controllers.',
  'nestjs-security-authorize-from-db-object':
    'Load the resource from the DB and authorize against it — never trust IDs from the request body alone.',
  'nestjs-security-no-secrets-in-code':
    'Secrets live in env or secret stores — never in source, committed config, or client bundles.',
  'nestjs-security-rate-limit-csrf-infrastructure':
    'Rate limiting and CSRF ship as shared infrastructure — wired once, not bolted on per route later.',
  'nestjs-security-tenant-required-scope':
    'Every query scopes to the current tenant — authorization filters belong in the data layer, not just the controller.',
  'nestjs-data-jobs-in-owning-domain':
    'Background jobs enqueue from the domain that owns the work — callers must not know another domain\'s queue shape.',
  'nestjs-data-nestjs-exceptions':
    'Map domain failures to NestJS HTTP exceptions — clients and logs get consistent, classifiable errors.',
  'nestjs-data-transactions-at-use-case':
    'Transactions start and end at the use-case service — not in repositories or controllers.',
  'nestjs-infra-guards-not-business-logic':
    'Guards authenticate and gate access — business rules stay in services where they can be tested.',
  'nestjs-config-module-not-process-env':
    'Inject ConfigService — services never read `process.env` directly.',
  'nestjs-config-openapi-from-code':
    'Generate OpenAPI from controllers and DTOs — the spec follows the code, not a hand-edited file.',
  'nestjs-module-dtos-not-entities-in-controllers':
    'Controllers accept and return DTOs — never ORM entities that expose your DB schema.',
  'nestjs-realtime-stream-idempotency-keys':
    'Require an Idempotency-Key on run creation — retries and double-clicks return the same run.',
  'nestjs-realtime-stream-llm-cancellation-backpressure':
    'Cancel downstream LLM work when the client disconnects and apply backpressure when it cannot keep up.',
  'nestjs-realtime-transport-namespaced-rooms':
    'Namespace room names with tenant or org scope so realtime events never cross tenants.',
  'nestjs-realtime-transport-redis-adapter-scaling':
    'Use a Redis adapter so WebSocket and SSE events reach clients on any app instance.',
  'nestjs-realtime-transport-sse-vs-websocket':
    'Use SSE for one-way LLM token streaming — reserve WebSocket for bidirectional chat.',
  'nestjs-realtime-transport-ws-auth-at-handshake':
    'Authenticate WebSocket connections at handshake — not with JWT verification on every message.',
  'nestjs-resilience-error-boundaries-per-domain':
    'Wrap each domain\'s UI in an error boundary — one widget crash must not blank the whole shell.',
  'nestjs-resilience-migrations-in-domain':
    'Each domain owns its database migrations — no cross-domain schema edits.',
  'nestjs-resilience-observability-infrastructure':
    'Standardize logs, metrics, and traces per domain so production incidents point to the right team.',
  'nx-isolation-nx-tag-contracts':
    'Cross-domain imports go through public barrel exports — Nx tags enforce who may depend on whom.',
  'nx-isolation-test-isolation':
    'Domain tests boot only their domain — not the whole platform graph.',
  'nx-isolation-deps-no-global-state':
    'No module-level mutable singletons — state injects at app entry so domains can run standalone.',
  'nx-isolation-deps-one-direction':
    'Dependencies flow one way: apps → feature → data-access → shared — shared never imports a domain.',
  'nx-isolation-deps-server-client-boundary':
    'Tag every lib `scope:server`, `scope:client`, or `scope:isomorphic` — enforce at the bundler boundary.',
  'nx-monorepo-docs-readme-required':
    'Every domain lib ships a README — ownership, boundaries, and how to run it alone.',
  'nx-monorepo-owner-build-per-domain':
    'Each domain produces its own build artifact — deploy, rollback, and monitor independently.',
  'react-platform-composition-not-inheritance':
    'UI libs receive behavior via props and slots — they do not pull from app context.',
  'react-platform-config-not-conditionals':
    'Host-specific behavior passes in as props — shared libs do not sniff where they run.',
  'react-platform-version-public-contracts':
    'Version public data-access exports — breaking changes ship as v2, not silent rewrites.',
  'nx-monorepo-schema-single-source':
    'Shared types live in one library — server and client import the same schema.',
  'nestjs-auth-separate-authn-authz':
    'Authentication (who you are) and authorization (what you may do) stay in separate guards and services.',
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

function ruleIdFromPath(filePath: string): string {
  return filePath.split('/').pop()!.replace('.rule.md', '');
}

function rewriteSummary(source: string, newSummary: string): string | null {
  const match = source.match(/^(---[\s\S]*?---\n\n# .+\n\n)([\s\S]*?)(\n\n## Why it matters)/m);
  if (!match) return null;

  const current = match[2].trim().replace(/\n+/g, ' ');
  if (current === newSummary) return null;

  return source.replace(match[0], `${match[1]}${newSummary}${match[3]}`);
}

function main() {
  const files = findRuleFiles(CATALOG).sort();
  let changed = 0;

  for (const file of files) {
    const id = ruleIdFromPath(file);
    const newSummary = SUMMARY_BY_ID[id];
    if (!newSummary) continue;

    const source = readFileSync(file, 'utf8');
    const updated = rewriteSummary(source, newSummary);
    if (!updated) continue;

    writeFileSync(file, updated);
    changed++;
    console.log(`  ✓ ${id}`);
  }

  console.log(`Done. Updated ${changed} summaries.`);
}

main();
