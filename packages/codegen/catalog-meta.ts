export const STACKS = ['nx', 'react', 'nestjs'] as const;
export type Stack = (typeof STACKS)[number];

export const STACK_PREFIX: Record<Stack, string> = {
  nx: 'nx-',
  react: 'react-',
  nestjs: 'nestjs-',
};

/** Which stack owns each domain folder (testing-contracts may appear in nx and nestjs) */
export const DOMAIN_STACK: Record<string, Stack> = {
  'domain-isolation': 'nx',
  'monorepo-hygiene': 'nx',
  'platform-composition': 'react',
  'nestjs-modules': 'nestjs',
  'nestjs-data-errors': 'nestjs',
  'auth-security': 'nestjs',
  'realtime-streaming': 'nestjs',
  'runtime-resilience': 'nestjs',
};

export const MULTI_STACK_DOMAINS = new Set(['testing-contracts']);

export function expectedStackForRule(domain: string, ruleId: string, fileStack?: Stack): Stack {
  if (fileStack) return fileStack;
  if (ruleId.startsWith('nx-')) return 'nx';
  if (ruleId.startsWith('react-')) return 'react';
  if (ruleId.startsWith('nestjs-')) return 'nestjs';
  return DOMAIN_STACK[domain] ?? 'nestjs';
}

export function catalogRoot(): string {
  return 'catalog/stacks';
}

export function ruleCatalogPath(stack: Stack, domain: string, group: string, id: string): string {
  return `${catalogRoot()}/${stack}/domains/${domain}/groups/${group}/${id}.rule.md`;
}

export function domainCatalogPath(stack: Stack, domain: string): string {
  return `${catalogRoot()}/${stack}/domains/${domain}/domain.yaml`;
}

export function groupCatalogPath(stack: Stack, domain: string, group: string): string {
  return `${catalogRoot()}/${stack}/domains/${domain}/groups/${group}/group.yaml`;
}
