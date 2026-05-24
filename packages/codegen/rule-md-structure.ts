/**
 * Enforceable Principle Record outline.
 * CI fails if any required heading is missing, unknown, or out of order.
 */

export const RULE_MD_EXTENSION = '.rule.md';

/** Frontmatter-only fields — body sections are never duplicated here */
export const RULE_MD_FRONTMATTER_KEYS = [
  'id',
  'stack',
  'domain',
  'group',
  'status',
  'since',
  'priority',
  'tags',
  'related',
  'replaced_by',
] as const;

/** Required H2 narrative + example sections in document order */
export const RULE_MD_H2_NARRATIVE = [
  'Why it matters',
  'Issues',
  'How to fix',
] as const;

export const RULE_MD_H2_EXAMPLES = ['Incorrect', 'Correct'] as const;

export const RULE_MD_H2_REQUIRED = [
  ...RULE_MD_H2_NARRATIVE,
  ...RULE_MD_H2_EXAMPLES,
] as const;

export const RULE_MD_H2_OPTIONAL = ['When not to apply'] as const;

export type RuleMdH2Required = (typeof RULE_MD_H2_REQUIRED)[number];

export const ALL_ALLOWED_H2 = [...RULE_MD_H2_REQUIRED, ...RULE_MD_H2_OPTIONAL] as const;

/** @deprecated Legacy wrapper — migration scripts only */
export const LEGACY_RULE_DETAILS_H2 = 'Rule Details';

/** @deprecated Legacy H3 subsections — migration scripts only */
export const LEGACY_RULE_DETAILS_H3 = RULE_MD_H2_NARRATIVE;
