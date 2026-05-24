/**
 * Add explicit [type] tags to every ## Why it matters bullet.
 * Run: tsx scripts/migrate/tag-why-bullets.ts
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalogRoot } from '../../packages/codegen/catalog-meta.js';
import {
  classifyIssueText,
  formatWhyBullet,
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

function stripTag(line: string): string {
  return line.replace(/^\[[a-z][a-z0-9-]*\]\s+/, '').trim();
}

function tagWhySection(content: string): { updated: string; changed: boolean } {
  const match = content.match(/## Why it matters\n\n([\s\S]*?)(?=\n## |\s*$)/);
  if (!match) return { updated: content, changed: false };

  const section = match[1];
  const lines = section.split('\n');
  const taggedLines: string[] = [];
  let changed = false;

  for (const rawLine of lines) {
    if (!rawLine.trim().startsWith('-')) {
      taggedLines.push(rawLine);
      continue;
    }

    const bullet = rawLine.trim().replace(/^-\s*/, '');
    const text = normalizeIssueText(stripTag(bullet));
    if (text.length < 10 || isGarbageIssueBullet(text)) {
      taggedLines.push(rawLine);
      continue;
    }

    const type = classifyIssueText(text);
    const tagged = formatWhyBullet({ type, text });
    if (rawLine.trim() !== tagged) changed = true;
    taggedLines.push(tagged);
  }

  if (!changed) return { updated: content, changed: false };

  const newSection = `## Why it matters\n\n${taggedLines.join('\n')}`;
  return {
    updated: content.replace(match[0], newSection),
    changed: true,
  };
}

function main() {
  const files = findRuleFiles(CATALOG).sort();
  console.log(`Tagging Why it matters in ${files.length} rules...`);
  let changed = 0;

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const { updated, changed: fileChanged } = tagWhySection(source);
    if (!fileChanged) continue;
    writeFileSync(file, updated);
    changed++;
    console.log(`  ✓ ${file.replace(`${CATALOG}/`, '')}`);
  }

  console.log(`Done. Updated ${changed} files.`);
}

main();
