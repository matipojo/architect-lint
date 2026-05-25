import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { validateCatalog } from './catalog-schema.js';
import { ConsumerConfigSchema } from '../../packages/codegen/consumer-config.js';
import { assertCatalogComplete } from '../../packages/codegen/issue-types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');

function countJsonRules(dir: string): number {
  if (!existsSync(dir)) return 0;
  let count = 0;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      count += countJsonRules(full);
    } else if (entry.endsWith('.json') && !entry.startsWith('.')) {
      count++;
    }
  }
  return count;
}

function validateConsumerConfig(): string[] {
  const configPath = join(ROOT, '.architect-lint.yaml');
  if (!existsSync(configPath)) return [];
  try {
    ConsumerConfigSchema.parse(parseYaml(readFileSync(configPath, 'utf8')));
    return [];
  } catch (e) {
    return [`.architect-lint.yaml: ${e instanceof Error ? e.message : String(e)}`];
  }
}

function checkGenerated(): string[] {
  const errors: string[] = [];
  const required = [
    'registry/index.json',
    'catalog/issue-type-catalog.md',
    'website/src/data/sidebar.json',
    'website/src/data/rule-stats.json',
    'website/src/data/showcase-rules.json',
    'website/src/data/stacks.json',
    'website/src/data/domains.json',
    'website/src/data/rules-index.json',
    'skills/architect-lint/SKILL.md',
    'skills/architect-lint-review/SKILL.md',
    'skills/stacks/nx/SKILL.md',
    'skills/stacks/react/SKILL.md',
    'skills/stacks/nestjs/SKILL.md',
    'skills/stacks/integrations/SKILL.md',
  ];

  for (const file of required) {
    if (!existsSync(join(ROOT, file))) {
      errors.push(`Missing generated file: ${file} — run pnpm docs:generate`);
    }
  }

  const ruleCount = countJsonRules(join(ROOT, 'website/src/data/rules'));
  if (ruleCount === 0) {
    errors.push('No rule JSON files in website/src/data/rules — run pnpm docs:generate');
  }

  if (existsSync(join(ROOT, 'registry/index.json'))) {
    const index = JSON.parse(readFileSync(join(ROOT, 'registry/index.json'), 'utf8'));
    if (!index.rules?.length) {
      errors.push('registry/index.json has no rules');
    }
    if (ruleCount > 0 && index.rules?.length !== ruleCount) {
      errors.push(`Rule count mismatch: index=${index.rules?.length}, json files=${ruleCount}`);
    }
  }

  return errors;
}

function main() {
  console.log('Validating architect-lint catalog...\n');

  const catalogErrors = validateCatalog();
  const configErrors = validateConsumerConfig();
  const genErrors = checkGenerated();
  const issueCatalogErrors = assertCatalogComplete();
  const all = [...catalogErrors, ...configErrors, ...genErrors, ...issueCatalogErrors];

  if (all.length === 0) {
    console.log('✓ All checks passed');
    process.exit(0);
  }

  for (const err of all) {
    console.error(`✗ ${err}`);
  }
  process.exit(1);
}

main();
