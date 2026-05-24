import { z } from 'zod';
import { catalogClassifyPatterns } from './issue-type-catalog.js';
import { ISSUE_TYPES, isIssueType, type IssueType } from './issue-types.js';

export const IssueSchema = z.object({
  type: z.enum(ISSUE_TYPES),
  text: z.string().min(10, 'issue text must be at least 10 characters'),
});

export type Issue = z.infer<typeof IssueSchema>;

const ISSUE_LINE = /^-\s*\[([a-z][a-z0-9-]*)\]\s+(.+)$/;
const TAGGED_TEXT = /^\[([a-z][a-z0-9-]*)\]\s+(.+)$/;

export function formatIssuesSection(issues: Issue[]): string {
  return issues.map((issue) => `- [${issue.type}] ${issue.text}`).join('\n');
}

export function formatWhyBullet(issue: Issue): string {
  return `- [${issue.type}] ${issue.text}`;
}

export function parseIssuesSection(content: string, fileLabel: string): Issue[] {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error(`${fileLabel}: Issues section must not be empty`);
  }

  const issues: Issue[] = [];
  for (const rawLine of trimmed.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(ISSUE_LINE);
    if (!match) {
      throw new Error(
        `${fileLabel}: invalid issue line "${line}" — expected "- [type] description"`,
      );
    }

    const typeSlug = match[1];
    const text = match[2].trim();

    if (!isIssueType(typeSlug)) {
      throw new Error(
        `${fileLabel}: unknown issue type "${typeSlug}" — allowed: ${ISSUE_TYPES.join(', ')}`,
      );
    }

    issues.push({ type: typeSlug, text });
  }

  if (issues.length === 0) {
    throw new Error(`${fileLabel}: Issues section must contain at least one tagged bullet`);
  }

  return issues.map((issue) => IssueSchema.parse(issue));
}

export function parseClassifiedBulletSection(content: string, fileLabel: string): Issue[] {
  const bullets = content
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('-'))
    .map((line) => line.replace(/^-\s*/, '').trim())
    .filter((line) => line.length > 0);

  return bullets.map((bullet) => {
    const tagged = bullet.match(TAGGED_TEXT);
    if (!tagged) {
      return IssueSchema.parse({
        type: classifyIssueText(bullet),
        text: bullet,
      });
    }

    const typeSlug = tagged[1];
    if (!isIssueType(typeSlug)) {
      throw new Error(
        `${fileLabel}: unknown issue type "${typeSlug}" — allowed: ${ISSUE_TYPES.join(', ')}`,
      );
    }

    return IssueSchema.parse({
      type: typeSlug,
      text: tagged[2].trim(),
    });
  });
}

export function classifyIssueText(text: string): IssueType {
  const lower = text.toLowerCase();
  const rules = catalogClassifyPatterns();

  for (const rule of rules) {
    if (rule.patterns.some((pattern) => pattern.test(text) || pattern.test(lower))) {
      return rule.type;
    }
  }

  // Prefer explicit tags in rule markdown; auto-classify is a migration aid only.
  return 'agent-gets-lost';
}

export function isGarbageIssueBullet(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed === '--') return true;
  if (/^←/.test(trimmed)) return true;
  if (/^(Apps|Libs)\//.test(trimmed)) return true;
  if (/^(Scattered everywhere|Everywhere it's needed|In one domain|In another|In a third|This week|Next week|Body contains password|No way to test without opening a socket)$/i.test(trimmed)) {
    return true;
  }
  if (/^If ignored:/i.test(trimmed)) return true;
  return false;
}

export function normalizeIssueText(text: string): string {
  let normalized = text.trim();
  normalized = normalized.replace(/^If ignored:\s*/i, '');
  normalized = normalized.replace(/^Failure mode:\s*/i, '');
  if (normalized.endsWith('?') && normalized.startsWith('What if')) {
    normalized = normalized.replace(/^What if /i, '').replace(/\?$/, ' — unhandled');
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  return normalized.trim();
}
