import { parse as parseYaml } from 'yaml';
import {
  ALL_ALLOWED_H2,
  RULE_MD_H2_NARRATIVE,
  RULE_MD_H2_REQUIRED,
} from './rule-md-structure.js';
import { parseIssuesSection } from './parse-rule-issues.js';
import { RuleFrontmatterSchema, RuleSchema, type Rule } from './schema.js';

type Section = { heading: string; level: 2 | 3; content: string; line: number };

function splitFrontmatter(source: string): { yaml: string; body: string; lineOffset: number } {
  if (!source.startsWith('---')) {
    throw new Error('File must start with YAML frontmatter (---)');
  }
  const end = source.indexOf('\n---', 3);
  if (end === -1) {
    throw new Error('Frontmatter must close with ---');
  }
  const yaml = source.slice(4, end).trim();
  const body = source.slice(end + 4).replace(/^\n/, '');
  const lineOffset = source.slice(0, end + 4).split('\n').length;
  return { yaml, body, lineOffset };
}

function parseSections(body: string, lineOffset: number): Section[] {
  const lines = body.split('\n');
  const sections: Section[] = [];
  let current: Section | null = null;
  let openFence: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = line.match(/^(`{3,})(\w*)\s*$/);

    if (fenceMatch) {
      const tick = fenceMatch[1];
      if (openFence === tick) {
        openFence = null;
      } else if (!openFence) {
        openFence = tick;
      }
      if (current) current.content += (current.content ? '\n' : '') + line;
      continue;
    }

    if (!openFence) {
      const h2 = line.match(/^## (.+)$/);
      const h3 = line.match(/^### (.+)$/);

      if (h2) {
        if (current) sections.push(current);
        current = { heading: h2[1].trim(), level: 2, content: '', line: lineOffset + i + 1 };
        continue;
      }
      if (h3) {
        if (current) sections.push(current);
        current = { heading: h3[1].trim(), level: 3, content: '', line: lineOffset + i + 1 };
        continue;
      }
    }

    if (current) {
      current.content += (current.content ? '\n' : '') + line;
    }
  }
  if (current) sections.push(current);
  return sections.map((s) => ({ ...s, content: s.content.trim() }));
}

function extractH1AndSummary(body: string): { title: string; summary: string; rest: string } {
  const match = body.match(/^# (.+)\n([\s\S]*?)(?=^## |\Z)/m);
  if (!match) {
    throw new Error('Missing H1 title (# Title)');
  }
  const title = match[1].trim();
  const summaryBlock = match[2].trim();
  const summary = summaryBlock.replace(/\n+/g, ' ').trim();
  if (!summary) {
    throw new Error('Missing summary paragraph after H1 (before first ## section)');
  }
  return { title, summary, rest: body.slice(match[0].length) };
}

function assertStructure(sections: Section[]): void {
  for (const s of sections) {
    if (s.level === 3) {
      throw new Error(
        `H3 "### ${s.heading}" at line ${s.line} is not allowed — use ## headings only`,
      );
    }
    if (s.level === 2 && !ALL_ALLOWED_H2.includes(s.heading as (typeof ALL_ALLOWED_H2)[number])) {
      throw new Error(
        `Unknown H2 "## ${s.heading}" at line ${s.line}. Allowed: ${ALL_ALLOWED_H2.join(', ')}`,
      );
    }
  }

  for (const required of RULE_MD_H2_REQUIRED) {
    if (!sections.some((s) => s.level === 2 && s.heading === required)) {
      throw new Error(`Missing required section "## ${required}"`);
    }
  }

  const h2Order = sections.filter((s) => s.level === 2).map((s) => s.heading);
  let reqIdx = 0;
  for (const h of h2Order) {
    if (h === RULE_MD_H2_REQUIRED[reqIdx]) reqIdx++;
  }
  if (reqIdx < RULE_MD_H2_REQUIRED.length) {
    throw new Error(`H2 sections out of order. Required: ${RULE_MD_H2_REQUIRED.join(' → ')}`);
  }
}

function parseCodeFence(sectionContent: string, fileLabel: string): {
  language: string;
  code: string;
} {
  const match = sectionContent.match(/^(`{3,})(\w*)\n([\s\S]*?)\1/m);
  if (!match) {
    throw new Error(`${fileLabel}: section must contain a fenced code block (\`\`\`language)`);
  }
  const language = match[2].trim() || 'text';
  const code = match[3].replace(/\n$/, '');
  if (!code.trim()) {
    throw new Error(`${fileLabel}: code block must not be empty`);
  }
  return { language, code };
}

export function parseRuleMarkdown(source: string, filePath?: string): Rule {
  const label = filePath ?? 'rule.md';
  const { yaml, body, lineOffset } = splitFrontmatter(source);
  const frontmatter = RuleFrontmatterSchema.parse(parseYaml(yaml));

  const { title, summary, rest } = extractH1AndSummary(body);
  const sections = parseSections(rest, lineOffset);
  assertStructure(sections);

  const byHeading = new Map<string, Section>();
  for (const s of sections) {
    if (byHeading.has(s.heading)) {
      throw new Error(`Duplicate heading "${s.heading}"`);
    }
    byHeading.set(s.heading, s);
  }

  const why = byHeading.get('Why it matters');
  const issuesSection = byHeading.get('Issues');
  const instead = byHeading.get('How to fix');
  const incorrect = byHeading.get('Incorrect');
  const correct = byHeading.get('Correct');
  const whenNot = byHeading.get('When not to apply');

  if (!why || !issuesSection || !instead || !incorrect || !correct) {
    throw new Error('Internal parse error: missing required sections');
  }

  const bad = parseCodeFence(incorrect.content, `${label} ## Incorrect`);
  const good = parseCodeFence(correct.content, `${label} ## Correct`);
  const issues = parseIssuesSection(issuesSection.content, `${label} ## Issues`);

  const details = [
    `## Why it matters\n\n${why.content}`,
    `## How to fix\n\n${instead.content}`,
  ].join('\n\n');

  const rule = {
    ...frontmatter,
    title,
    summary,
    why_it_matters: why.content,
    issues,
    do_this_instead: instead.content,
    details,
    rationale: instead.content,
    bad: { label: 'Incorrect', language: bad.language, code: bad.code },
    good: { label: 'Correct', language: good.language, code: good.code },
    ...(whenNot?.content ? { when_not_to_apply: whenNot.content } : {}),
  };

  return RuleSchema.parse(rule);
}
