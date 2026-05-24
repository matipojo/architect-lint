export const ISSUE_TYPES = [
  'security',
  'data-integrity',
  'coupling',
  'blast-radius',
  'contract',
  'layer-violation',
  'testability',
  'performance',
  'reliability',
  'ux',
  'maintainability',
  'governance',
  'operational',
] as const;

export type IssueType = (typeof ISSUE_TYPES)[number];

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  security: 'Security',
  'data-integrity': 'Data integrity',
  coupling: 'Coupling',
  'blast-radius': 'Blast radius',
  contract: 'Contract',
  'layer-violation': 'Layer violation',
  testability: 'Testability',
  performance: 'Performance',
  reliability: 'Reliability',
  ux: 'UX',
  maintainability: 'Maintainability',
  governance: 'Governance',
  operational: 'Operational',
};

export function isIssueType(value: string): value is IssueType {
  return (ISSUE_TYPES as readonly string[]).includes(value);
}

export function issueTypeLabel(type: IssueType): string {
  return ISSUE_TYPE_LABELS[type];
}
