/**
 * Flatten ## Rule Details + H3 subsections → top-level H2 sections.
 * Dedupe identical Why / What breaks content from YAML migration.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stringify as stringifyYaml } from 'yaml';
import { parse as parseYaml } from 'yaml';
import { catalogRoot } from '../../packages/codegen/catalog-meta.js';
import { RuleFrontmatterSchema } from '../../packages/codegen/schema.js';
import { improveWhatBreaks } from '../../packages/codegen/rule-md-what-breaks.js';
import { parseRuleMarkdown } from '../../packages/codegen/parse-rule-md.js';
import {
  LEGACY_RULE_DETAILS_H2,
  LEGACY_RULE_DETAILS_H3,
} from '../../packages/codegen/rule-md-structure.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const CATALOG = join(ROOT, catalogRoot());

type Section = { heading: string; level: 2 | 3; content: string };

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

function splitFrontmatter(source: string): { yaml: string; body: string } {
  const end = source.indexOf('\n---', 3);
  return {
    yaml: source.slice(4, end).trim(),
    body: source.slice(end + 4).replace(/^\n/, ''),
  };
}

function parseLooseSections(body: string): Section[] {
  const afterTitle = body.replace(/^# .+\n[\s\S]*?(?=^## |\Z)/m, '');
  const sections: Section[] = [];
  let current: Section | null = null;
  let openFence: string | null = null;

  for (const line of afterTitle.split('\n')) {
    const fenceMatch = line.match(/^(`{3,})(\w*)\s*$/);
    if (fenceMatch) {
      const tick = fenceMatch[1];
      if (openFence === tick) openFence = null;
      else if (!openFence) openFence = tick;
      if (current) current.content += (current.content ? '\n' : '') + line;
      continue;
    }

    if (!openFence) {
      const h2 = line.match(/^## (.+)$/);
      const h3 = line.match(/^### (.+)$/);
      if (h2) {
        if (current) sections.push(current);
        current = { heading: h2[1].trim(), level: 2, content: '' };
        continue;
      }
      if (h3) {
        if (current) sections.push(current);
        current = { heading: h3[1].trim(), level: 3, content: '' };
        continue;
      }
    }

    if (current) current.content += (current.content ? '\n' : '') + line;
  }
  if (current) sections.push(current);
  return sections.map((s) => ({ ...s, content: s.content.trim() }));
}

function extractTitleSummary(body: string): { title: string; summary: string } {
  const match = body.match(/^# (.+)\n([\s\S]*?)(?=^## |\Z)/m);
  if (!match) throw new Error('Missing H1');
  return {
    title: match[1].trim(),
    summary: match[2].trim().replace(/\n+/g, ' ').trim(),
  };
}

function sectionMap(sections: Section[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const s of sections) {
    map.set(s.heading, s.content);
  }
  return map;
}

function extractNarrative(sections: Section[]): {
  why: string;
  whatBreaks: string;
  instead: string;
} {
  const map = sectionMap(sections);

  if (map.has('Why it matters') && sections.find((s) => s.heading === 'Why it matters')?.level === 2) {
    return {
      why: map.get('Why it matters') ?? '',
      whatBreaks: map.get('What breaks') ?? '',
      instead: map.get('How to fix') ?? '',
    };
  }

  for (const heading of LEGACY_RULE_DETAILS_H3) {
    if (!map.has(heading)) {
      throw new Error(`Missing narrative section "${heading}"`);
    }
  }

  return {
    why: map.get('Why it matters') ?? '',
    whatBreaks: map.get('What breaks') ?? '',
    instead: map.get('How to fix') ?? '',
  };
}

function parseIncorrectCorrect(map: Map<string, string>): { badLang: string; badCode: string; goodLang: string; goodCode: string } {
  const incorrect = map.get('Incorrect') ?? '';
  const correct = map.get('Correct') ?? '';
  const badMatch = incorrect.match(/^(`{3,})(\w*)\n([\s\S]*?)\1/m);
  const goodMatch = correct.match(/^(`{3,})(\w*)\n([\s\S]*?)\1/m);
  if (!badMatch || !goodMatch) throw new Error('Missing Incorrect/Correct fences');
  return {
    badLang: badMatch[2].trim() || 'text',
    badCode: badMatch[3].replace(/\n$/, ''),
    goodLang: goodMatch[2].trim() || 'text',
    goodCode: goodMatch[3].replace(/\n$/, ''),
  };
}

function fence(language: string, code: string): string {
  const normalized = code.replace(/\\`\\`\\`/g, '```');
  const tick = normalized.includes('```') ? '````' : '```';
  return `${tick}${language}\n${normalized}\n${tick}`;
}

function rebuildRuleMd(
  frontmatter: Record<string, unknown>,
  title: string,
  summary: string,
  why: string,
  whatBreaks: string,
  instead: string,
  badLang: string,
  badCode: string,
  goodLang: string,
  goodCode: string,
  whenNot?: string,
): string {
  const parts = [
    '---',
    stringifyYaml(frontmatter).trim(),
    '---',
    '',
    `# ${title}`,
    '',
    summary,
    '',
    '## Why it matters',
    '',
    why,
    '',
    '## What breaks',
    '',
    whatBreaks,
    '',
    '## How to fix',
    '',
    instead,
    '',
    '## Incorrect',
    '',
    fence(badLang, badCode),
    '',
    '## Correct',
    '',
    fence(goodLang, goodCode),
  ];

  if (whenNot?.trim()) {
    parts.push('', '## When not to apply', '', whenNot.trim());
  }

  return parts.join('\n') + '\n';
}

function main() {
  const files = findRuleFiles(CATALOG).sort();
  console.log(`Flattening ${files.length} rules...`);

  for (const file of files) {
    const rel = file.slice(ROOT.length + 1);
    const source = readFileSync(file, 'utf8');
    const { yaml, body } = splitFrontmatter(source);
    const frontmatter = RuleFrontmatterSchema.parse(parseYaml(yaml));
    const { title, summary } = extractTitleSummary(body);
    const sections = parseLooseSections(body);
    const map = sectionMap(sections);

    const { why, whatBreaks: rawBreaks, instead } = extractNarrative(sections);
    const { badLang, badCode, goodLang, goodCode } = parseIncorrectCorrect(map);
    const whatBreaks = improveWhatBreaks(why, map.get('What breaks') ?? rawBreaks, summary, badCode);

    const md = rebuildRuleMd(
      { ...frontmatter, replaced_by: frontmatter.replaced_by ?? null },
      title,
      summary,
      why,
      whatBreaks,
      instead,
      badLang,
      badCode,
      goodLang,
      goodCode,
      map.get('When not to apply'),
    );

    parseRuleMarkdown(md, rel);
    writeFileSync(file, md);
    console.log(`  ✓ ${basename(file)}`);
  }

  console.log('Done.');
}

main();
