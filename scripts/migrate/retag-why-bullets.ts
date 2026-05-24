/**
 * Retag "Why it matters" bullets using the issue-type catalog.
 * Run: tsx scripts/migrate/retag-why-bullets.ts
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalogRoot } from '../../packages/codegen/catalog-meta.js';
import { classifyIssueText, formatWhyBullet, type Issue } from '../../packages/codegen/parse-rule-issues.js';
import type { IssueType } from '../../packages/codegen/issue-types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const CATALOG = join(ROOT, catalogRoot());

const ISSUE_LINE = /^-\s*\[([a-z][a-z0-9-]*)\]\s+(.+)$/;

/** Exact bullet text → correct tag (overrides classifyIssueText). */
const TAG_OVERRIDES: Record<string, IssueType> = {
  'Midnight tweak to shared/ — no platform review, multiple apps red before standup.': 'spreads-failure',
  'Generic 500 in two different cases = inability to distinguish a bug from bad input.': 'unclear-failure',
  'One mega-Strategy with if/else per auth method — adding OAuth risks breaking JWT login.': 'hard-to-change',
  'adding OAuth or API keys means editing one Strategy full of conditionals.': 'hard-to-change',
  'a bug in one auth branch breaks every endpoint using that Strategy.': 'spreads-failure',
  'If deploy is monolithic, rule 1 (domain separation) is theory. In practice you have one app.': 'cant-rollback',
  'The service is the use case. The use case is the natural transaction boundary.': 'layer-mixing',
  'This is the runtime expression of "domain separation". If they\'re separated in code but explode together at runtime — the separation isn\'t real.':
    'spreads-failure',
  'Business logic in the gateway — can\'t hit it with HTTP tests or reuse it outside WebSockets.': 'hard-to-test',
  'Failure spans domains — no boundary to assign, two teams ping-pong the incident.': 'blind-in-prod',
  'Shared libs become merge bottlenecks — every feature waits on the same conflict queue.': 'hard-to-change',
  'Client code leaking to server = runtime errors on `window`.': 'layer-mixing',
  'Permission duplicated in a decorator and a UI if — update one, forget the other, ship a hole.': 'data-leak',
  'Context inheritance — component can\'t render in Storybook without faking half the app shell.': 'hard-to-test',
  'Push a job onto another domain\'s queue — you now depend on their internal job shape and renames.': 'hidden-coupling',
  'New host needs a lib edit — the "shared" component is now owned by whoever embedded it last.': 'hard-to-change',
  'API calls inside UI components — swapping the backend means rewriting components, not one mock.': 'hard-to-test',
  'Flat room names like `doc-123` — same ID collision leaks events across tenants.': 'data-leak',
  'The moment a domain edits another\'s tables, separation is in code only — not in the DB.': 'hidden-coupling',
  '"We\'ll handle it later" = never.': 'abuse-vulnerable',
  'Domain tests boot the whole platform — CI minutes climb with every new app added.': 'slow-ci',
  'Without a standard, you end up with five log formats and can\'t search anything.': 'blind-in-prod',
  'shared imports a domain — every new app drags another edit through platform review.': 'hidden-coupling',
  'When `AuthGuard` both authenticates and decides permissions, you can\'t swap auth method (JWT → session, OAuth → API key) without touching every permission check.':
    'hard-to-change',
  'Permission checks belong inside the domain that knows the resource. Auth checks are cross-cutting infrastructure.':
    'layer-mixing',
  'No feature flags — every partial feature waits for a coordinated release train.': 'hard-to-change',
  'Long-lived feature branches — merge conflicts and drift until nobody trusts main.': 'hard-to-change',
  'Scattered feature ifs — nobody knows which flags are dead code safe to delete.': 'safe-to-delete',
  'frontend client codegen builds against a spec that doesn\'t match runtime behavior.': 'api-drift',
  'If the workspace domain touches the catalog\'s repository, a change to the catalog\'s internal schema breaks the workspace.':
    'hidden-coupling',
  'Reach past the service into a foreign repository — auth and validation never run.': 'hidden-coupling',
  'The UI needs to know when to show a "searching the site" spinner, when to show the result, when to show an error. From free text — impossible.':
    'bad-ux',
  'Unstructured token stream — logs and analytics can\'t tell tool calls from text deltas.': 'blind-in-prod',
  'logging and analytics can\'t parse unstructured token output.': 'blind-in-prod',
  'Same type written twice — one side adds a field, the other doesn\'t, silent production bug.': 'data-corruption',
  'Types maintained twice — OpenAPI, hand types, and runtime behavior disagree within a sprint.': 'api-drift',
  'Config baked into the module — tests reach for process.env instead of injecting values.': 'hard-to-test',
  'When the client disconnected — downstream work keeps running': 'wastes-money',
  'In-memory SSE buffers — resume lands on another node and the stream starts over or 404s.': 'cant-scale',
  'Env vars scattered in services — missing key crashes prod an hour after deploy, not at boot.': 'drops-connection',
  'Breaking change to data-access without a version — consumers break with no migration path.': 'breaking-change',
  'ORM swap forces edits across every service — persistence leaks past the repository boundary.': 'hard-to-change',
  'Ad-hoc error shapes per controller — clients and logs cannot classify failures consistently.': 'unclear-failure',
};

/** Benefit statements rewritten as failure modes. */
const TEXT_REWRITES: Record<string, string> = {
  'A NestJS exception filter can map exceptions to a unified error format.':
    'Ad-hoc error shapes per controller — clients and logs cannot classify failures consistently.',
  'Tomorrow you swap TypeORM for Prisma or vice versa — change the repository only, services don\'t move.':
    'ORM swap forces edits across every service — persistence leaks past the repository boundary.',
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

function resolveTag(text: string, current: IssueType): IssueType {
  if (TAG_OVERRIDES[text]) return TAG_OVERRIDES[text];
  if (current === 'agent-gets-lost') return classifyIssueText(text);
  return current;
}

function retagFile(filePath: string): boolean {
  const source = readFileSync(filePath, 'utf8');
  const match = source.match(/^(## Why it matters\n\n)([\s\S]*?)(?=\n## |\Z)/m);
  if (!match) return false;

  const [, heading, body] = match;
  const lines = body.split('\n');
  const updatedLines: string[] = [];
  let changed = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      updatedLines.push('');
      continue;
    }

    const bullet = trimmed.match(ISSUE_LINE);
    if (!bullet) {
      updatedLines.push(line);
      continue;
    }

    const current = bullet[1] as IssueType;
    let text = bullet[2].trim();
    if (TEXT_REWRITES[text]) {
      text = TEXT_REWRITES[text];
      changed = true;
    }

    const next = resolveTag(text, current);
    const issue: Issue = { type: next, text };
    const formatted = formatWhyBullet(issue);

    if (formatted !== trimmed) changed = true;
    updatedLines.push(formatted);
  }

  if (!changed) return false;

  const block = updatedLines.join('\n').trimEnd();
  const updated = source.replace(match[0], `${heading}${block}\n`);
  writeFileSync(filePath, updated);
  return true;
}

function main() {
  const files = findRuleFiles(CATALOG);
  console.log(`Retagging Why it matters in ${files.length} rules...`);
  let changed = 0;
  for (const file of files.sort()) {
    if (retagFile(file)) {
      changed++;
      console.log(`  ✓ ${file.replace(`${CATALOG}/`, '')}`);
    }
  }
  console.log(`Done. Updated ${changed} files.`);
}

main();
