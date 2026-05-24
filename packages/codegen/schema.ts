import { z } from 'zod';
import { DOMAIN_STACK, MULTI_STACK_DOMAINS, STACKS, STACK_PREFIX, type Stack } from './catalog-meta.js';

export const PrioritySchema = z.enum(['critical', 'high', 'medium', 'informational']);
export const StatusSchema = z.enum(['active', 'deprecated', 'retired']);
export const StackSchema = z.enum(STACKS);

const RULE_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const ExampleSchema = z.object({
  label: z.string().min(1),
  language: z.string().min(1).default('typescript'),
  code: z.string().min(1),
  explanation: z.string().optional(),
});

/** YAML frontmatter for .rule.md — body sections are parsed separately */
export const RuleFrontmatterSchema = z.object({
  id: z.string().regex(RULE_ID_PATTERN, 'Rule id must be kebab-case slug'),
  stack: StackSchema,
  domain: z.string().min(1),
  group: z.string().min(1),
  status: StatusSchema.default('active'),
  replaced_by: z.string().nullable().optional(),
  since: z.string().regex(DATE_PATTERN, 'since must be YYYY-MM-DD'),
  tags: z.array(z.string().min(1)).default([]),
  priority: PrioritySchema.default('high'),
  related: z.array(z.string().regex(RULE_ID_PATTERN)).default([]),
});

export type RuleFrontmatter = z.infer<typeof RuleFrontmatterSchema>;

export const RuleSchema = z
  .object({
    id: z.string().regex(RULE_ID_PATTERN, 'Rule id must be kebab-case slug'),
    stack: StackSchema,
    domain: z.string().min(1),
    group: z.string().min(1),
    status: StatusSchema.default('active'),
    replaced_by: z.string().nullable().optional(),
    since: z.string().regex(DATE_PATTERN, 'since must be YYYY-MM-DD'),
    title: z.string().min(5, 'title must be at least 5 characters'),
    summary: z.string().min(10, 'summary must be at least 10 characters'),
    why_it_matters: z.string().min(10, 'why_it_matters must be at least 10 characters'),
    what_breaks: z.string().min(10, 'what_breaks must be at least 10 characters'),
    do_this_instead: z.string().min(10, 'do_this_instead must be at least 10 characters'),
    details: z.string().min(20, 'details must be at least 20 characters'),
    rationale: z.string().min(10, 'rationale must be at least 10 characters'),
    tags: z.array(z.string().min(1)).default([]),
    priority: PrioritySchema.default('high'),
    bad: ExampleSchema.optional(),
    good: ExampleSchema.optional(),
    when_not_to_apply: z.string().optional(),
    related: z.array(z.string().regex(RULE_ID_PATTERN)).default([]),
  })
  .superRefine((rule, ctx) => {
    const expectedPrefix = STACK_PREFIX[rule.stack];
    if (!rule.id.startsWith(expectedPrefix)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Rule id must start with "${expectedPrefix}" for stack "${rule.stack}"`,
        path: ['id'],
      });
    }

    const domainStack = DOMAIN_STACK[rule.domain];
    if (!domainStack && !MULTI_STACK_DOMAINS.has(rule.domain)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unknown domain "${rule.domain}"`,
        path: ['domain'],
      });
    } else if (domainStack && domainStack !== rule.stack && !MULTI_STACK_DOMAINS.has(rule.domain)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Domain "${rule.domain}" belongs to stack "${domainStack}", not "${rule.stack}"`,
        path: ['stack'],
      });
    }

    if (rule.status === 'active' && (!rule.bad || !rule.good)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Active rules must include both Incorrect and Correct examples',
        path: ['bad'],
      });
    }

    if (rule.replaced_by && rule.replaced_by === rule.id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'replaced_by cannot reference the same rule',
        path: ['replaced_by'],
      });
    }
  });

export type Rule = z.infer<typeof RuleSchema>;

export const DomainSchema = z
  .object({
    id: z.string().min(1),
    stack: StackSchema,
    title: z.string().min(1),
    description: z.string().min(1),
    tags: z.array(z.string()).default([]),
    order: z.number().int().nonnegative().default(0),
  })
  .superRefine((domain, ctx) => {
    const expected = DOMAIN_STACK[domain.id];
    if (!expected && !MULTI_STACK_DOMAINS.has(domain.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unknown domain "${domain.id}"`,
        path: ['id'],
      });
    } else if (expected && expected !== domain.stack) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Domain "${domain.id}" must use stack "${expected}"`,
        path: ['stack'],
      });
    }
  });

export type Domain = z.infer<typeof DomainSchema>;

export const GroupSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
});

export const StackManifestSchema = z.object({
  id: StackSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int().nonnegative().default(0),
});

export const RULE_ID_REGEX = RULE_ID_PATTERN;

export function isValidStack(value: string): value is Stack {
  return (STACKS as readonly string[]).includes(value);
}
