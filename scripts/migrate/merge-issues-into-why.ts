/**
 * Merge unique ## Issues bullets into ## Why it matters, then remove ## Issues.
 * Run: tsx scripts/migrate/merge-issues-into-why.ts
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalogRoot } from '../../packages/codegen/catalog-meta.js';
import {
  isGarbageIssueBullet,
  normalizeIssueText,
} from '../../packages/codegen/parse-rule-issues.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const CATALOG = join(ROOT, catalogRoot());

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

function extractSection(source: string, heading: string): string {
  const match = source.match(new RegExp(`^## ${heading}\\n\\n([\\s\\S]*?)(?=\\n## |$)`, 'm'));
  return match?.[1]?.trim() ?? '';
}

function norm(text: string): string {
  return normalizeIssueText(text.replace(/^\[[^\]]+\]\s*/, ''))
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function bulletTexts(content: string): string[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('-'))
    .map((line) => line.replace(/^-\s*/, ''));
}

function toWhyBullet(raw: string): string {
  const tagged = raw.match(/^\[([a-z][a-z0-9-]*)\]\s+(.+)$/);
  const text = normalizeIssueText(tagged?.[2] ?? raw);
  return `- ${text}`;
}

function mergeFile(filePath: string): { merged: number; removed: boolean } {
  const source = readFileSync(filePath, 'utf8');
  if (!source.includes('## Issues')) {
    return { merged: 0, removed: false };
  }

  const why = extractSection(source, 'Why it matters');
  const issues = extractSection(source, 'Issues');
  const whyNorm = new Set(bulletTexts(why).map(norm));

  const uniqueBullets: string[] = [];
  for (const raw of bulletTexts(issues)) {
    const text = normalizeIssueText(raw.replace(/^\[[^\]]+\]\s*/, ''));
    if (text.length < 10 || isGarbageIssueBullet(text)) continue;
    if (whyNorm.has(norm(raw))) continue;
    whyNorm.add(norm(raw));
    uniqueBullets.push(toWhyBullet(raw));
  }

  let updated = source;
  if (uniqueBullets.length > 0) {
    const whyBlock = `${why}\n${uniqueBullets.join('\n')}`;
    updated = updated.replace(
      /## Why it matters\n\n[\s\S]*?(?=\n## |$)/m,
      `## Why it matters\n\n${whyBlock}\n\n`,
    );
  }

  updated = updated.replace(/## Issues\n\n[\s\S]*?(?=\n## )/, '');

  if (updated === source) {
    throw new Error(`Could not migrate ${filePath}`);
  }

  writeFileSync(filePath, updated);
  return { merged: uniqueBullets.length, removed: true };
}

function main() {
  const files = findRuleFiles(CATALOG);
  console.log(`Migrating ${files.length} rules...`);
  let mergedTotal = 0;
  let changed = 0;

  for (const file of files.sort()) {
    const { merged, removed } = mergeFile(file);
    if (!removed) continue;
    changed++;
    mergedTotal += merged;
    const rel = file.slice(CATALOG.length + 1);
    console.log(`  ✓ ${rel}${merged > 0 ? ` (+${merged} bullets)` : ''}`);
  }

  console.log(`Done. Updated ${changed} files, merged ${mergedTotal} unique bullets.`);
}

main();
