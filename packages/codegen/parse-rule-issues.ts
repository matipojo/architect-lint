import { z } from 'zod';
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

  const rules: Array<{ type: IssueType; patterns: RegExp[] }> = [
    {
      type: 'security',
      patterns: [
        /leak|secret|password|idor|tenant|org'?s data|brute|dos|csrf|unauthenticated|vulnerab|authorize on input|another tenant|cross-tenant|data leak|trust(ing)? the user/i,
      ],
    },
    {
      type: 'data-integrity',
      patterns: [/orphan|diverge|inconsistent|ownerid on one side|duplicate run|double charge|persist|schema change becomes/i],
    },
    {
      type: 'coupling',
      patterns: [/coupl|hidden|knows about|reach into|bypass|global state|untraceable|internal job structure|shared.*knows|not shared anymore/i],
    },
    {
      type: 'blast-radius',
      patterns: [/whole system|entire screen|multiple apps|blast|standalone|monolith|one app|wipes|take down|take down sites|dev speed.*fix one bug|parallel without/i],
    },
    {
      type: 'contract',
      patterns: [/breaking change|public api|contract|openapi|spec rot|runtime error|fields\?|version|entity directly|db schema|generated client|hand-maintained spec|wrong docs/i],
    },
    {
      type: 'layer-violation',
      patterns: [/layer|controller knows|repository knows|querybuilder|guard.*business|interceptor.*behavior|transaction in a controller|transaction inside a repository|service knows about typeorm|orm entity|process\.env directly/i],
    },
    {
      type: 'testability',
      patterns: [/test|ci |mock|storybook|e2e|unit|integration|not testable|opening a socket|affected|nx affected|40 minutes/i],
    },
    {
      type: 'performance',
      patterns: [/expensive|memory|scale|backpressure|pay for|sticky|jwt verify|40 min|proxy timeout|keep-alive|real money|double charges/i],
    },
    {
      type: 'reliability',
      patterns: [/disconnect|timeout|crash|boot|startup|silent|dead connection|reconnect|last-event-id|heartbeats|won't start|validation at boot|proxy/i],
    },
    {
      type: 'ux',
      patterns: [/ui shows|spinner|tab closes|refresh|history|streaming.*while|sidebar|user closes|where it stopped|two devices/i],
    },
    {
      type: 'maintainability',
      patterns: [/grep|6 months|year|rot|drift|nobody knows|can't swap|can't add|decoration|theory|40 \`if|hand-maintained|grep across|safe to delete|who added/i],
    },
    {
      type: 'governance',
      patterns: [/codeowners|readme|owner|review|merge without|platform lead|tech-review|named owner|micro-domain|friction|paged|domain-scoped/i],
    },
    {
      type: 'operational',
      patterns: [/deploy|rollback|production|datadog|loki|rotation|day one|monolithic deploy|per-domain rollback/i],
    },
  ];

  for (const rule of rules) {
    if (rule.patterns.some((pattern) => pattern.test(text) || pattern.test(lower))) {
      return rule.type;
    }
  }

  return 'maintainability';
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
  if (/^One source of truth:/i.test(trimmed)) return true;
  if (/^No surprises\./i.test(trimmed)) return true;
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
