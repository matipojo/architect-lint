import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const RULES_ROOT = path.resolve(__dirname, '../../src/data/rules');

export interface RuleCodeExample {
  label: string;
  language: string;
  code: string;
}

export interface RuleRelated {
  id: string;
  href: string;
}

export interface RuleResources {
  permalink: string;
  viewSource: string;
  suggestChange: string;
  discuss: string;
}

export interface RuleDocument {
  id: string;
  stack: string;
  domain: string;
  group: string;
  title: string;
  summary: string;
  details: string;
  priority: string;
  status: string;
  tags: string[];
  since: string;
  replaced_by: string | null;
  bad?: RuleCodeExample;
  good?: RuleCodeExample;
  when_not_to_apply?: string;
  related: RuleRelated[];
  resources: RuleResources;
}

export type RulePageMeta = Omit<RuleDocument, 'details'>;

export function findRuleJsonFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findRuleJsonFiles(full));
    } else if (entry.name.endsWith('.json')) {
      results.push(full);
    }
  }
  return results;
}

export function loadRule(filePath: string): RuleDocument {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as RuleDocument;
}

export function rulePath(stack: string, domain: string, id: string): string {
  return path.join(RULES_ROOT, stack, domain, `${id}.json`);
}

export function priorityLabel(priority: string): string {
  if (priority === 'critical') return 'Critical';
  if (priority === 'high') return 'High';
  if (priority === 'medium') return 'Medium';
  return 'Informational';
}

function langAlias(language: string): string {
  const aliases: Record<string, string> = {
    typescript: 'ts',
    javascript: 'js',
    tsx: 'tsx',
    jsx: 'jsx',
  };
  return aliases[language.toLowerCase()] ?? language.toLowerCase();
}

export function sanitizeMarkdown(markdown: string): string {
  return markdown
    .split(/(```[\s\S]*?```)/g)
    .map((part, index) => (index % 2 === 1 ? part : part.replace(/</g, '&lt;').replace(/>/g, '&gt;')))
    .join('');
}

export function buildRuleContentMarkdown(rule: RuleDocument): string {
  const parts: string[] = [sanitizeMarkdown(rule.details.trim()), ''];

  if (rule.bad) {
    parts.push('## Incorrect', '', `<p class="code-compare-label bad">${rule.bad.label}</p>`, '', `\`\`\`${langAlias(rule.bad.language)}`, rule.bad.code, '```', '');
  }

  if (rule.good) {
    parts.push('## Correct', '', `<p class="code-compare-label good">${rule.good.label}</p>`, '', `\`\`\`${langAlias(rule.good.language)}`, rule.good.code, '```', '');
  }

  if (rule.when_not_to_apply) {
    parts.push('## When not to apply', '', sanitizeMarkdown(rule.when_not_to_apply.trim()), '');
  }

  if (rule.related.length > 0) {
    parts.push('## Related principles', '');
    for (const related of rule.related) {
      parts.push(`- [\`${related.id}\`](${related.href})`);
    }
    parts.push('');
  }

  return parts.join('\n');
}

export function applyRulePageData(pageData: {
  title: string;
  description?: string;
  params?: Record<string, string>;
  frontmatter: Record<string, unknown>;
}) {
  const params = pageData.params;
  if (!params) return;

  const { stack, domain, id } = params;
  if (!stack || !domain || !id) return;

  const rule = loadRule(rulePath(stack, domain, id));
  const { details: _details, ...ruleMeta } = rule;

  pageData.title = rule.id;
  pageData.description = rule.title;
  pageData.frontmatter.rule = ruleMeta;
  pageData.frontmatter.editLink = rule.resources.suggestChange;
}
