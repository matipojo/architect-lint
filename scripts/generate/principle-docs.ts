/**
 * Codegen: catalog YAML → React site JSON data, skills, registry index
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { DomainSchema, StackManifestSchema, type Rule } from '../../packages/codegen/schema.js';
import { parseRuleMarkdown } from '../../packages/codegen/parse-rule-md.js';
import { STACKS, catalogRoot } from '../../packages/codegen/catalog-meta.js';
import { buildIndexEntry, buildRuleDocument, domainDisplayName, stackDisplayName } from './principle-page.js';
import { ruleCatalogPath, rulePermalink } from '../config/site.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const CATALOG = join(ROOT, catalogRoot());
const WEBSITE_DATA = join(ROOT, 'website/src/data');
const RULES_DATA = join(WEBSITE_DATA, 'rules');
const SKILLS_DIR = join(ROOT, 'skills');

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

function loadRules(): Rule[] {
  const files = findRuleFiles(CATALOG);
  const rules = files.map((f) => parseRuleMarkdown(readFileSync(f, 'utf8'), f));
  rules.sort((a, b) => a.id.localeCompare(b.id));
  return rules;
}

function loadStacks(): Array<{ id: string; title: string; description: string; order: number }> {
  return STACKS.map((stack) => {
    const raw = parseYaml(readFileSync(join(CATALOG, stack, 'stack.yaml'), 'utf8'));
    const manifest = StackManifestSchema.parse(raw);
    return {
      id: manifest.id,
      title: manifest.title,
      description: manifest.description,
      order: manifest.order,
    };
  }).sort((a, b) => a.order - b.order);
}

function loadDomains(): Array<{ id: string; stack: string; title: string; description: string; order: number }> {
  const domains: Array<{ id: string; stack: string; title: string; description: string; order: number }> = [];
  for (const stack of STACKS) {
    const domainsDir = join(CATALOG, stack, 'domains');
    if (!statSync(domainsDir).isDirectory()) continue;
    for (const entry of readdirSync(domainsDir)) {
      const domainPath = join(domainsDir, entry, 'domain.yaml');
      if (!statSync(domainPath).isFile()) continue;
      const raw = parseYaml(readFileSync(domainPath, 'utf8'));
      const domain = DomainSchema.parse(raw);
      domains.push({
        id: domain.id,
        stack: domain.stack,
        title: domain.title,
        description: domain.description,
        order: domain.order,
      });
    }
  }
  domains.sort((a, b) => a.order - b.order || a.stack.localeCompare(b.stack));
  return domains;
}

function ruleHref(rule: Rule): string {
  return `/rules/${rule.stack}/${rule.domain}/${rule.id}`;
}

function generateWebsiteData(rules: Rule[]) {
  rmSync(RULES_DATA, { recursive: true, force: true });
  mkdirSync(RULES_DATA, { recursive: true });

  const idToRule = new Map(rules.map((r) => [r.id, r]));
  const stacks = loadStacks();
  const domains = loadDomains();

  for (const rule of rules) {
    const outDir = join(RULES_DATA, rule.stack, rule.domain);
    mkdirSync(outDir, { recursive: true });
    const doc = buildRuleDocument(rule, idToRule);
    writeFileSync(join(outDir, `${rule.id}.json`), JSON.stringify(doc, null, 2) + '\n');
  }

  const sidebar: Array<{
    text: string;
    collapsed: boolean;
    items: Array<{ text: string; id?: string; title?: string; href: string }>;
  }> = [
    {
      text: 'Principles Reference',
      collapsed: true,
      items: [{ text: 'Overview', href: '/rules' }],
    },
  ];

  for (const stack of stacks) {
    const stackDomains = domains.filter((d) => d.stack === stack.id);
    for (const domain of stackDomains) {
      const domainRules = rules.filter((r) => r.stack === stack.id && r.domain === domain.id);
      domainRules.sort((a, b) => a.id.localeCompare(b.id));
      sidebar.push({
        text: `${stack.title} · ${domain.title}`,
        collapsed: true,
        items: domainRules.map((r) => ({
          text: r.id,
          id: r.id,
          title: r.title,
          href: ruleHref(r),
        })),
      });
    }
  }

  mkdirSync(WEBSITE_DATA, { recursive: true });

  writeFileSync(join(WEBSITE_DATA, 'stacks.json'), JSON.stringify(stacks, null, 2) + '\n');
  writeFileSync(join(WEBSITE_DATA, 'domains.json'), JSON.stringify(domains, null, 2) + '\n');
  writeFileSync(join(WEBSITE_DATA, 'sidebar.json'), JSON.stringify(sidebar, null, 2) + '\n');

  const stats = {
    total: rules.length,
    byStack: Object.fromEntries(stacks.map((s) => [s.id, rules.filter((r) => r.stack === s.id).length])),
    byDomain: Object.fromEntries(
      domains.map((d) => [d.id, rules.filter((r) => r.domain === d.id && r.stack === d.stack).length]),
    ),
    byPriority: {
      critical: rules.filter((r) => r.priority === 'critical').length,
      high: rules.filter((r) => r.priority === 'high').length,
      medium: rules.filter((r) => r.priority === 'medium').length,
      informational: rules.filter((r) => r.priority === 'informational').length,
    },
  };
  writeFileSync(join(WEBSITE_DATA, 'rule-stats.json'), JSON.stringify(stats, null, 2) + '\n');

  const showcase = stacks.map((stack) => {
    const stackRules = rules.filter((r) => r.stack === stack.id).slice(0, 3);
    return {
      stack: stack.id,
      title: stack.title,
      rules: stackRules.map((r) => ({
        id: r.id,
        title: r.title,
        summary: r.summary,
        href: ruleHref(r),
      })),
    };
  });
  writeFileSync(join(WEBSITE_DATA, 'showcase-rules.json'), JSON.stringify(showcase, null, 2) + '\n');

  writeFileSync(
    join(WEBSITE_DATA, 'rules-index.json'),
    JSON.stringify(
      rules.map((r) => ({
        id: r.id,
        stack: r.stack,
        domain: r.domain,
        title: r.title,
        summary: r.summary,
        href: ruleHref(r),
      })),
      null,
      2,
    ) + '\n',
  );
}

function generateSkills(rules: Rule[]) {
  const byStack = new Map<string, Rule[]>();
  for (const rule of rules) {
    if (!byStack.has(rule.stack)) byStack.set(rule.stack, []);
    byStack.get(rule.stack)!.push(rule);
  }

  rmSync(join(SKILLS_DIR, 'stacks'), { recursive: true, force: true });

  for (const [stack, stackRules] of byStack) {
    const skillDir = join(SKILLS_DIR, 'stacks', stack);
    mkdirSync(skillDir, { recursive: true });

    stackRules.sort((a, b) => a.id.localeCompare(b.id));
    const displayName = stackDisplayName(stack);

    const rows = stackRules.map((r) => {
      const catalogPath = ruleCatalogPath(r.stack, r.domain, r.group, r.id);
      const permalink = rulePermalink(r.stack, r.domain, r.id);
      return `| ${r.id} | \`${catalogPath}\` | ${permalink} |`;
    });

    const skill = `---
name: architect-lint-${stack}
description: Review ${displayName} architecture principles (${stackRules.length} rules). Read catalog Principle Records at review time — never use cached content.
---

# ${displayName}

When reviewing, **READ** each rule file below. Do not use cached or inlined content.

| Rule | Catalog path | Permalink |
| --- | --- | --- |
${rows.join('\n')}

## Output format (Tier 1)

\`\`\`
❌ {rule-id} — {title}
   {permalink}
   File: {path}:{line}
   Problem: ...
   Fix: ...
\`\`\`

## Output format (Tier 2 — with \`--explain\`)

Add \`do_this_instead\` from the rule and a concrete fix hint.

## Full details (Tier 3)

User opens the permalink for bad/good examples and related principles.
`;

    writeFileSync(join(skillDir, 'SKILL.md'), skill);
  }

  const stacks = loadStacks();
  const orchestrator = `---
name: architect-lint
description: Route architecture reviews to stack-specific architect-lint skills (Nx, React, NestJS). Use when reviewing code against professional architecture principles, running /architect-lint-review, or when the user asks about architecture standards.
---

# architect-lint

Orchestrator for stack-specific architecture principle skills. Each skill references \`catalog/stacks/**/*.rule.md\` — the single source of truth.

## Stack skills

| Stack | Skill | Rules |
| --- | --- | --- |
${stacks
  .map((s) => {
    const count = (byStack.get(s.id) ?? []).length;
    return `| ${s.title} | \`architect-lint-${s.id}\` | ${count} |`;
  })
  .join('\n')}

## Workflow

1. Read \`.architect-lint.yaml\` in the consumer repo (if present) to select stacks and review scope.
2. Pick the narrowest stack skill for the change (nx / react / nestjs).
3. **Read** each referenced \`*.rule.md\` file before citing a violation.
4. Output findings with permalinks to \`${rulePermalink('{stack}', '{domain}', '{rule-id}')}\`.

## Review command

Use \`/architect-lint-review\` for progressive disclosure (Tier 1 → Tier 2 → permalink).
`;

  mkdirSync(join(SKILLS_DIR, 'architect-lint'), { recursive: true });
  writeFileSync(join(SKILLS_DIR, 'architect-lint', 'SKILL.md'), orchestrator);

  const reviewSkill = `---
name: architect-lint-review
description: Run an architecture review against catalog principles with progressive disclosure output. Use when the user invokes /architect-lint-review or asks for an architecture lint review.
---

# architect-lint-review

Review changed code against principles in \`catalog/stacks/\` (via stack skills).

## Steps

1. Read \`.architect-lint.yaml\` if present:
   - \`stacks\`: which stacks to apply (\`nx\`, \`react\`, \`nestjs\`)
   - \`scope\`: \`changed\` | \`all\` (files to review)
   - \`preset\`: \`recommended\` | \`baseline\` | \`strict\` | \`all\`
2. Load \`registry/index.json\` for rule metadata and permalinks.
3. For each applicable rule, **read** the catalog Principle Record (\`.rule.md\`).
4. Emit findings using Tier 1 format; add rationale when \`--explain\` is requested.

## Tier 1 output

\`\`\`
❌ nestjs-realtime-transport-sse-vs-websocket — Pick one mechanism per flow — don't confuse SSE with WebSocket
   https://matipojo.github.io/architect-lint/rules/nestjs/realtime-streaming/nestjs-realtime-transport-sse-vs-websocket
   File: src/chat.gateway.ts:12
   Problem: WebSocket used for one-way LLM stream
   Fix: Use SSE for server→client streaming
\`\`\`

## Tier 2 (\`--explain\`)

Add the **How to fix** section from the rule.

## Tier 3

User opens the permalink for full examples and related principles.
`;

  mkdirSync(join(SKILLS_DIR, 'architect-lint-review'), { recursive: true });
  writeFileSync(join(SKILLS_DIR, 'architect-lint-review', 'SKILL.md'), reviewSkill);

  rmSync(join(SKILLS_DIR, 'domains'), { recursive: true, force: true });
}

function generateIndex(rules: Rule[]) {
  const index = {
    generatedAt: new Date().toISOString(),
    rules: rules.map(buildIndexEntry),
  };
  writeFileSync(join(ROOT, 'registry/index.json'), JSON.stringify(index, null, 2) + '\n');
}

function main() {
  console.log('Generating from catalog...');
  const rules = loadRules();
  console.log(`  Found ${rules.length} rules`);

  generateWebsiteData(rules);
  console.log('  ✓ docs site JSON data');

  generateSkills(rules);
  console.log('  ✓ Stack skill stubs');

  generateIndex(rules);
  console.log('  ✓ registry/index.json');

  console.log('Done.');
}

main();
