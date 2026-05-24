/**
 * Normalize ## Issues sections — dedupe, strip boilerplate prefixes, cap count.
 * Run: tsx scripts/migrate/normalize-rule-issues.ts
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
  parseIssuesSection,
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

function cleanIssueText(text: string): string {
  let cleaned = normalizeIssueText(text);
  cleaned = cleaned.replace(/^Without this:\s*/i, '');
  cleaned = cleaned.replace(/^Failure mode:\s*/i, '');
  cleaned = cleaned.replace(/^Without this:\s*failure mode:\s*/i, '');
  cleaned = cleaned.replace(/^Failure mode:\s*without this:\s*/i, '');
  cleaned = cleaned.replace(/^Without this:\s*failure mode:\s*without\s+/i, 'Without ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  if (/^without cancellation,/i.test(cleaned)) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
}

function whyTexts(why: string): Set<string> {
  return new Set(
    why
      .split('\n')
      .map((line) => line.replace(/^-\s*/, '').trim().toLowerCase())
      .filter(Boolean),
  );
}

function normalizeIssues(rawIssues: Issue[], why: string, summary: string): Issue[] {
  const whySet = whyTexts(why);
  const seen = new Set<string>();
  const result: Issue[] = [];

  for (const issue of rawIssues) {
    const text = cleanIssueText(issue.text);
    if (text.length < 10 || isGarbageIssueBullet(text)) continue;

    const normalizedWhy = text.toLowerCase();
    if (whySet.has(normalizedWhy)) continue;

    const key = normalizedWhy.replace(/^without /, '');
    if (seen.has(key)) continue;
    seen.add(key);

    result.push({
      type: issue.type === 'maintainability' ? classifyIssueText(text) : issue.type,
      text,
    });
  }

  if (result.length === 0) {
    const whyBullets = why
      .split('\n')
      .map((line) => line.replace(/^-\s*/, '').trim())
      .filter((line) => line.length >= 10);
    for (const bullet of whyBullets.slice(0, 2)) {
      const text = cleanIssueText(bullet);
      result.push({ type: classifyIssueText(text), text });
    }
  }

  if (result.length === 0) {
    result.push({ type: classifyIssueText(summary), text: summary });
  }

  return result.slice(0, 4);
}

function normalizeFile(filePath: string): boolean {
  const source = readFileSync(filePath, 'utf8');
  const issuesRaw = extractSection(source, 'Issues');
  if (!issuesRaw) return false;

  const why = extractSection(source, 'Why it matters');
  const summaryMatch = source.match(/^# .+\n([\s\S]*?)(?=^## )/m);
  const summary = summaryMatch?.[1]?.replace(/\n+/g, ' ').trim() ?? '';

  const rel = filePath.replace(`${CATALOG}/`, '');
  const parsed = parseIssuesSection(issuesRaw, rel);
  const normalized = normalizeIssues(parsed, why, summary);
  const block = formatIssuesSection(normalized);

  const updated = source.replace(
    /## Issues\n\n[\s\S]*?(?=\n## )/,
    `## Issues\n\n${block}\n\n`,
  );

  if (updated === source) return false;
  writeFileSync(filePath, updated);
  console.log(`  ✓ ${rel} (${normalized.length} issues)`);
  return true;
}

function main() {
  const files = findRuleFiles(CATALOG);
  console.log(`Normalizing ${files.length} rules...`);
  let changed = 0;
  for (const file of files.sort()) {
    if (normalizeFile(file)) changed++;
  }
  console.log(`Done. Updated ${changed} files.`);
}

main();
