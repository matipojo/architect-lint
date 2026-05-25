import { stringify as stringifyYaml } from 'yaml';
import type { Rule } from './schema.js';
import { improveWhatBreaks } from './rule-md-what-breaks.js';

function dedupeLines(text: string): string {
  const lines = text.split('\n');
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const key = line.trim();
    if (!key) {
      if (out.length && out[out.length - 1] !== '') out.push('');
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out.join('\n').trim();
}

function extractBoldSection(details: string, heading: string): string {
  const re = new RegExp(`\\*\\*${heading}\\*\\*\\s*([\\s\\S]*?)(?=\\n\\s*\\*\\*|$)`, 'i');
  const match = details.match(re);
  return match ? dedupeLines(match[1].trim()) : '';
}

function introBeforeBoldSections(details: string): string {
  const idx = details.search(/\n\s*\*\*/);
  if (idx === -1) return details.trim();
  return details.slice(0, idx).trim();
}

function splitLegacyDetails(details: string, rationale: string, summary: string): {
  why: string;
  whatBreaks: string;
  instead: string;
} {
  const intro = introBeforeBoldSections(details);
  const whySection = extractBoldSection(details, 'Why it matters');
  const whatBreaksSection = extractBoldSection(details, 'What breaks');
  const consequences = extractBoldSection(details, 'Consequences');

  const instead = intro || rationale.trim();
  const why = whySection || summary;
  const whatBreaks =
    whatBreaksSection ||
    consequences ||
    whySection ||
    `- ${summary.trim()}`;

  return { why: sanitizeSectionBody(why), whatBreaks: sanitizeSectionBody(whatBreaks), instead: sanitizeSectionBody(instead) };
}

function frontmatterYaml(rule: Rule): string {
  const fm: Record<string, unknown> = {
    id: rule.id,
    stack: rule.stack,
    domain: rule.domain,
    group: rule.group,
    status: rule.status,
    since: rule.since,
    priority: rule.priority,
    tags: rule.tags,
    related: rule.related,
  };
  if (rule.replaced_by != null) {
    fm.replaced_by = rule.replaced_by;
  }
  return stringifyYaml(fm).trim();
}

function sanitizeSectionBody(text: string): string {
  return text
    .split('\n')
    .map((line) => (line.startsWith('## ') ? `**${line.slice(3).trim()}**` : line))
    .join('\n')
    .trim();
}

function normalizeExampleCode(code: string): string {
  return code.replace(/\\`\\`\\`/g, '```');
}

function fence(language: string, code: string): string {
  const normalized = normalizeExampleCode(code);
  const tick = normalized.includes('```') ? '````' : '```';
  return `${tick}${language}\n${normalized.replace(/\n$/, '')}\n${tick}`;
}

export function ruleYamlToMarkdown(rule: Rule): string {
  if (!rule.bad || !rule.good) {
    throw new Error(`${rule.id}: active rules need bad and good examples to convert`);
  }

  const { why, whatBreaks: rawBreaks, instead } = splitLegacyDetails(rule.details, rule.rationale, rule.summary);
  const whatBreaks = improveWhatBreaks(why, rawBreaks, rule.summary, rule.bad.code);

  const parts = [
    '---',
    frontmatterYaml(rule),
    '---',
    '',
    `# ${rule.title}`,
    '',
    rule.summary.trim(),
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
    fence(rule.bad.language, rule.bad.code),
    '',
    '## Correct',
    '',
    fence(rule.good.language, rule.good.code),
  ];

  if (rule.when_not_to_apply?.trim()) {
    parts.push('', '## When not to apply', '', rule.when_not_to_apply.trim());
  }

  return parts.join('\n') + '\n';
}
