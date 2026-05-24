/**
 * Migrate ## What breaks → ## Issues with tagged bullets.
 * Run: tsx scripts/migrate/what-breaks-to-issues.ts
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalogRoot } from '../../packages/codegen/catalog-meta.js';
import {
  classifyIssueText,
  formatIssuesSection,
  isGarbageIssueBullet,
  normalizeIssueText,
  type Issue,
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

function extractSection(body: string, heading: string): string {
  const match = body.match(new RegExp(`^## ${heading}\\n\\n([\\s\\S]*?)(?=\\n## |\\Z)`, 'm'));
  return match?.[1]?.trim() ?? '';
}

function dedupeIssues(issues: Issue[]): Issue[] {
  const seen = new Set<string>();
  const result: Issue[] = [];
  for (const issue of issues) {
    const key = `${issue.type}:${issue.text.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(issue);
  }
  return result;
}

function bulletsFromSection(content: string): string[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('-'))
    .map((line) => line.replace(/^-\s*/, '').trim());
}

function fallbackFromWhy(why: string, summary: string): Issue[] {
  const whyBullets = bulletsFromSection(why).filter((b) => !isGarbageIssueBullet(b));
  const candidates = whyBullets.length > 0 ? whyBullets : [summary];
  return candidates.slice(0, 3).map((text) => ({
    type: classifyIssueText(text),
    text: normalizeIssueText(text),
  }));
}

function migrateIssues(whatBreaks: string, why: string, summary: string): Issue[] {
  const rawBullets = bulletsFromSection(whatBreaks);
  const issues: Issue[] = [];

  for (const raw of rawBullets) {
    if (isGarbageIssueBullet(raw)) continue;
    const text = normalizeIssueText(raw);
    if (text.length < 10) continue;
    issues.push({
      type: classifyIssueText(text),
      text,
    });
  }

  const deduped = dedupeIssues(issues);
  if (deduped.length > 0) {
    return deduped;
  }

  return dedupeIssues(fallbackFromWhy(why, summary));
}

function migrateFile(filePath: string): void {
  const source = readFileSync(filePath, 'utf8');
  if (!source.includes('## What breaks') && source.includes('## Issues')) {
    return;
  }

  const why = extractSection(source, 'Why it matters');
  const whatBreaks = extractSection(source, 'What breaks');
  const summaryMatch = source.match(/^# .+\n([\s\S]*?)(?=^## )/m);
  const summary = summaryMatch?.[1]?.replace(/\n+/g, ' ').trim() ?? '';

  const issues = migrateIssues(whatBreaks, why, summary);
  const issuesBlock = formatIssuesSection(issues);

  const updated = source.replace(
    /## What breaks\n\n[\s\S]*?(?=\n## )/,
    `## Issues\n\n${issuesBlock}\n\n`,
  );

  if (updated === source) {
    throw new Error(`Could not migrate ${filePath}`);
  }

  writeFileSync(filePath, updated);
  console.log(`  ✓ ${filePath.slice(CATALOG.length + 1)} (${issues.length} issues)`);
}

function main() {
  const files = findRuleFiles(CATALOG);
  console.log(`Migrating ${files.length} rules...`);
  for (const file of files.sort()) {
    migrateFile(file);
  }
  console.log('Done.');
}

main();
