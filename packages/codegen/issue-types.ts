import { ISSUE_TYPE_CATALOG } from './issue-type-catalog.js';

export { ISSUE_TYPE_CATALOG, ISSUE_FAMILIES, ISSUE_FAMILY_LABELS, ISSUE_TYPES_BY_FAMILY, type IssueFamily, issueTypeFamily } from './issue-type-catalog.js';

export const ISSUE_TYPES = [
  'double-charge',
  'secret-exposure',
  'data-leak',
  'abuse-vulnerable',
  'data-corruption',
  'wastes-money',
  'slow-ci',
  'hard-to-test',
  'unclear-failure',
  'agent-gets-lost',
  'hard-to-change',
  'safe-to-delete',
  'hidden-coupling',
  'spreads-failure',
  'cant-run-alone',
  'layer-mixing',
  'api-drift',
  'breaking-change',
  'drops-connection',
  'bad-ux',
  'cant-scale',
  'no-ownership',
  'blind-in-prod',
  'cant-rollback',
] as const;

export type IssueType = (typeof ISSUE_TYPES)[number];

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = Object.fromEntries(
  ISSUE_TYPES.map((type) => [type, ISSUE_TYPE_CATALOG[type].label]),
) as Record<IssueType, string>;

export function isIssueType(value: string): value is IssueType {
  return (ISSUE_TYPES as readonly string[]).includes(value);
}

export function issueTypeLabel(type: IssueType): string {
  return ISSUE_TYPE_LABELS[type];
}

export function assertCatalogComplete(): string[] {
  const errors: string[] = [];
  for (const type of ISSUE_TYPES) {
    if (!ISSUE_TYPE_CATALOG[type]) {
      errors.push(`Missing catalog entry for issue type "${type}"`);
    }
  }
  for (const type of Object.keys(ISSUE_TYPE_CATALOG)) {
    if (!isIssueType(type)) {
      errors.push(`Catalog entry "${type}" is not in ISSUE_TYPES`);
    }
  }
  return errors;
}
