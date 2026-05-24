/**
 * Build rule document JSON for the React docs site.
 */
import type { Rule } from '../../packages/codegen/schema.js';
import {
  DOCS_BASE_URL,
  githubBlobUrl,
  githubDiscussUrl,
  githubEditUrl,
  ruleCatalogPath,
  rulePermalink,
} from '../config/site.js';

export interface RuleDocument {
  id: string;
  stack: string;
  domain: string;
  group: string;
  title: string;
  summary: string;
  why_it_matters: string;
  issues: Array<{ type: string; text: string }>;
  do_this_instead: string;
  details: string;
  rationale: string;
  priority: string;
  status: string;
  tags: string[];
  since: string;
  replaced_by: string | null;
  bad?: Rule['bad'];
  good?: Rule['good'];
  when_not_to_apply?: string;
  related: Array<{ id: string; stack: string; domain: string; href: string }>;
  resources: {
    permalink: string;
    viewSource: string;
    suggestChange: string;
    discuss: string;
    catalogPath: string;
  };
}

export function buildRuleDocument(
  rule: Rule,
  idToRule: Map<string, Rule>,
): RuleDocument {
  const catalogPath = ruleCatalogPath(rule.stack, rule.domain, rule.group, rule.id);

  return {
    id: rule.id,
    stack: rule.stack,
    domain: rule.domain,
    group: rule.group,
    title: rule.title,
    summary: rule.summary,
    why_it_matters: rule.why_it_matters,
    issues: rule.issues,
    do_this_instead: rule.do_this_instead,
    details: rule.details.trim(),
    rationale: rule.rationale,
    priority: rule.priority,
    status: rule.status,
    tags: rule.tags,
    since: rule.since,
    replaced_by: rule.replaced_by ?? null,
    ...(rule.bad ? { bad: rule.bad } : {}),
    ...(rule.good ? { good: rule.good } : {}),
    ...(rule.when_not_to_apply ? { when_not_to_apply: rule.when_not_to_apply } : {}),
    related: rule.related.map((relatedId) => {
      const related = idToRule.get(relatedId);
      const stack = related?.stack ?? rule.stack;
      const domain = related?.domain ?? rule.domain;
      return {
        id: relatedId,
        stack,
        domain,
        href: `/rules/${stack}/${domain}/${relatedId}`,
      };
    }),
    resources: {
      permalink: rulePermalink(rule.stack, rule.domain, rule.id),
      viewSource: githubBlobUrl(catalogPath),
      suggestChange: githubEditUrl(catalogPath),
      discuss: githubDiscussUrl(rule.id),
      catalogPath,
    },
  };
}

export function domainDisplayName(domainId: string): string {
  const names: Record<string, string> = {
    'domain-isolation': 'Domain Isolation',
    'monorepo-hygiene': 'Monorepo Hygiene',
    'platform-composition': 'Platform Composition',
    'nestjs-modules': 'NestJS Modules',
    'nestjs-data-errors': 'NestJS Data & Errors',
    'auth-security': 'Auth & Security',
    'realtime-streaming': 'Realtime & Streaming',
    'runtime-resilience': 'Runtime Resilience',
    'testing-contracts': 'Testing & Contracts',
  };
  return names[domainId] ?? domainId;
}

export function stackDisplayName(stackId: string): string {
  const names: Record<string, string> = {
    nx: 'Nx',
    react: 'React',
    nestjs: 'NestJS',
  };
  return names[stackId] ?? stackId;
}

export function buildIndexEntry(rule: Rule) {
  const catalogPath = ruleCatalogPath(rule.stack, rule.domain, rule.group, rule.id);
  return {
    id: rule.id,
    stack: rule.stack,
    domain: rule.domain,
    group: rule.group,
    title: rule.title,
    summary: rule.summary,
    priority: rule.priority,
    status: rule.status,
    tags: rule.tags,
    catalogPath,
    docUrl: rulePermalink(rule.stack, rule.domain, rule.id),
    rationale: rule.rationale,
    related: rule.related,
  };
}

export { DOCS_BASE_URL };
