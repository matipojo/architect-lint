/**
 * Dedupe ## Why it matters — drop garbage and near-duplicate failure bullets.
 * Run: pnpm exec tsx scripts/migrate/dedupe-why-matters.ts
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalogRoot } from '../../packages/codegen/catalog-meta.js';
import {
  formatWhyBullet,
  isGarbageIssueBullet,
  isNearDuplicate,
  parseClassifiedBulletSection,
  type Issue,
} from '../../packages/codegen/parse-rule-issues.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG = join(__dirname, '../..', catalogRoot());

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

function dedupeIssues(issues: Issue[]): Issue[] {
  const kept: Issue[] = [];

  for (const issue of issues) {
    if (isGarbageIssueBullet(issue.text)) continue;

    const duplicate = kept.some((existing) =>
      isNearDuplicate(existing.text, issue.text, existing.type === issue.type),
    );
    if (duplicate) continue;

    kept.push(issue);
  }

  return kept;
}

function dedupeFile(filePath: string): boolean {
  const rel = filePath.replace(`${CATALOG}/`, '');
  const source = readFileSync(filePath, 'utf8');
  const match = source.match(/(## Why it matters\n\n)([\s\S]*?)(\n\n## |\s*$)/);
  if (!match) return false;

  const parsed = parseClassifiedBulletSection(match[2], rel);
  const deduped = dedupeIssues(parsed);
  if (deduped.length === 0) return false;

  const newSection = deduped.map((issue) => formatWhyBullet(issue)).join('\n');
  const oldSection = match[2].trim();
  if (oldSection === newSection) return false;

  const updated = source.replace(match[0], `${match[1]}${newSection}${match[3]}`);
  writeFileSync(filePath, updated);
  console.log(`  ✓ ${rel} (${parsed.length} → ${deduped.length})`);
  return true;
}

function main() {
  const files = findRuleFiles(CATALOG).sort();
  console.log(`Deduping Why it matters in ${files.length} rules...`);
  let changed = 0;
  for (const file of files) {
    if (dedupeFile(file)) changed++;
  }
  console.log(`Done. Updated ${changed} files.`);
}

main();
