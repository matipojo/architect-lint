/**
 * One-time migration: catalog rule YAML files to Principle Record .rule.md format
 */
import { readFileSync, writeFileSync, unlinkSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { RuleSchema } from '../../packages/codegen/schema.js';
import { ruleYamlToMarkdown } from '../../packages/codegen/rule-yaml-to-md.js';
import { parseRuleMarkdown } from '../../packages/codegen/parse-rule-md.js';
import { catalogRoot } from '../../packages/codegen/catalog-meta.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const CATALOG = join(ROOT, catalogRoot());

function findYamlRules(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findYamlRules(full));
    } else if (entry.endsWith('.rule.yaml')) {
      results.push(full);
    }
  }
  return results;
}

function main() {
  const files = findYamlRules(CATALOG);
  console.log(`Converting ${files.length} rules...`);
  const errors: string[] = [];

  for (const yamlPath of files.sort()) {
    const rel = yamlPath.slice(ROOT.length + 1);
    try {
      const rule = RuleSchema.parse(parseYaml(readFileSync(yamlPath, 'utf8')));
      const md = ruleYamlToMarkdown(rule);
      parseRuleMarkdown(md, rel.replace('.yaml', '.md'));
      const mdPath = yamlPath.replace(/\.rule\.yaml$/, '.rule.md');
      writeFileSync(mdPath, md);
      unlinkSync(yamlPath);
      console.log(`  ✓ ${basename(mdPath)}`);
    } catch (e) {
      errors.push(`${rel}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (errors.length) {
    console.error('\nErrors:');
    for (const err of errors) console.error(`  ${err}`);
    process.exit(1);
  }
  console.log('Done.');
}

main();
