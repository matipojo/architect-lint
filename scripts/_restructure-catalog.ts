#!/usr/bin/env tsx
/**
 * One-shot catalog restructure — run once then discard.
 * Converts PA-XXXX ids → stack-prefixed slugs under catalog/stacks/{nx,react,nestjs}/.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync, unlinkSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OLD_CATALOG = join(ROOT, 'catalog/domains');
const NEW_CATALOG = join(ROOT, 'catalog/stacks');

const SLUG_MAP: Record<string, { id: string; stack: 'nx' | 'react' | 'nestjs' }> = {
  'PA-0001': { id: 'nx-isolation-full-separation', stack: 'nx' },
  'PA-0002': { id: 'nx-isolation-test-isolation', stack: 'nx' },
  'PA-0003': { id: 'react-platform-config-not-conditionals', stack: 'react' },
  'PA-0004': { id: 'nx-isolation-nx-tag-contracts', stack: 'nx' },
  'PA-0005': { id: 'nx-isolation-deps-no-global-state', stack: 'nx' },
  'PA-0006': { id: 'react-platform-composition-not-inheritance', stack: 'react' },
  'PA-0007': { id: 'react-platform-feature-flags-not-branches', stack: 'react' },
  'PA-0008': { id: 'react-platform-version-public-contracts', stack: 'react' },
  'PA-0009': { id: 'nx-isolation-deps-one-direction', stack: 'nx' },
  'PA-0010': { id: 'nx-monorepo-docs-readme-required', stack: 'nx' },
  'PA-0011': { id: 'nx-isolation-deps-library-purpose', stack: 'nx' },
  'PA-0012': { id: 'nx-isolation-deps-server-client-boundary', stack: 'nx' },
  'PA-0013': { id: 'nx-monorepo-schema-single-source', stack: 'nx' },
  'PA-0014': { id: 'nestjs-resilience-error-boundaries-per-domain', stack: 'nestjs' },
  'PA-0015': { id: 'nestjs-testing-generated-client-not-fetch', stack: 'nestjs' },
  'PA-0016': { id: 'nx-monorepo-schema-config-at-entry', stack: 'nx' },
  'PA-0017': { id: 'nestjs-resilience-observability-infrastructure', stack: 'nestjs' },
  'PA-0018': { id: 'nestjs-resilience-migrations-in-domain', stack: 'nestjs' },
  'PA-0019': { id: 'nx-monorepo-owner-codeowners-boundaries', stack: 'nx' },
  'PA-0020': { id: 'nx-monorepo-owner-build-per-domain', stack: 'nx' },
  'PA-0021': { id: 'nx-isolation-gov-friction-new-domain', stack: 'nx' },
  'PA-0022': { id: 'nestjs-module-domain-standalone', stack: 'nestjs' },
  'PA-0023': { id: 'nestjs-module-cross-module-via-services', stack: 'nestjs' },
  'PA-0024': { id: 'nestjs-module-dtos-not-entities-in-controllers', stack: 'nestjs' },
  'PA-0025': { id: 'nestjs-infra-guards-not-business-logic', stack: 'nestjs' },
  'PA-0026': { id: 'nestjs-config-module-not-process-env', stack: 'nestjs' },
  'PA-0027': { id: 'nestjs-config-for-root-async', stack: 'nestjs' },
  'PA-0028': { id: 'nestjs-data-nestjs-exceptions', stack: 'nestjs' },
  'PA-0029': { id: 'nestjs-data-repository-pattern', stack: 'nestjs' },
  'PA-0030': { id: 'nestjs-data-transactions-at-use-case', stack: 'nestjs' },
  'PA-0031': { id: 'nestjs-data-jobs-in-owning-domain', stack: 'nestjs' },
  'PA-0032': { id: 'nx-testing-three-tiers', stack: 'nx' },
  'PA-0033': { id: 'nestjs-config-openapi-from-code', stack: 'nestjs' },
  'PA-0034': { id: 'nestjs-auth-separate-authn-authz', stack: 'nestjs' },
  'PA-0035': { id: 'nestjs-auth-one-passport-strategy-per-method', stack: 'nestjs' },
  'PA-0036': { id: 'nestjs-auth-policies-not-decorators', stack: 'nestjs' },
  'PA-0037': { id: 'nestjs-security-authorize-from-db-object', stack: 'nestjs' },
  'PA-0038': { id: 'nestjs-security-tenant-required-scope', stack: 'nestjs' },
  'PA-0039': { id: 'nestjs-security-no-secrets-in-code', stack: 'nestjs' },
  'PA-0040': { id: 'nestjs-security-rate-limit-csrf-infrastructure', stack: 'nestjs' },
  'PA-0041': { id: 'nestjs-realtime-transport-sse-vs-websocket', stack: 'nestjs' },
  'PA-0042': { id: 'nestjs-realtime-stream-llm-cancellation-backpressure', stack: 'nestjs' },
  'PA-0043': { id: 'nestjs-realtime-transport-thin-gateway', stack: 'nestjs' },
  'PA-0044': { id: 'nestjs-realtime-transport-ws-auth-at-handshake', stack: 'nestjs' },
  'PA-0045': { id: 'nestjs-realtime-transport-redis-adapter-scaling', stack: 'nestjs' },
  'PA-0046': { id: 'nestjs-realtime-transport-namespaced-rooms', stack: 'nestjs' },
  'PA-0047': { id: 'nestjs-realtime-stream-agent-runs-as-resource', stack: 'nestjs' },
  'PA-0048': { id: 'nestjs-realtime-stream-structured-agent-events', stack: 'nestjs' },
  'PA-0049': { id: 'nestjs-realtime-stream-idempotency-keys', stack: 'nestjs' },
  'PA-0050': { id: 'nestjs-realtime-stream-heartbeats-reconnect', stack: 'nestjs' },
};

const STACK_META = {
  nx: { title: 'Nx', description: 'Monorepo boundaries, hygiene, and testing for Nx + pnpm workspaces', order: 1 },
  react: { title: 'React', description: 'Platform composition and frontend architecture patterns', order: 2 },
  nestjs: { title: 'NestJS', description: 'Backend modules, data access, security, and realtime streaming', order: 3 },
} as const;

const DOMAIN_STACK: Record<string, 'nx' | 'react' | 'nestjs'> = {
  'domain-isolation': 'nx',
  'monorepo-hygiene': 'nx',
  'testing-contracts': 'nx',
  'platform-composition': 'react',
  'nestjs-modules': 'nestjs',
  'nestjs-data-errors': 'nestjs',
  'auth-security': 'nestjs',
  'realtime-streaming': 'nestjs',
  'runtime-resilience': 'nestjs',
};

function findRuleFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...findRuleFiles(full));
    else if (entry.endsWith('.rule.yaml')) results.push(full);
  }
  return results;
}

function remapId(oldId: string): string {
  return SLUG_MAP[oldId]?.id ?? oldId;
}

function main() {
  rmSync(NEW_CATALOG, { recursive: true, force: true });

  for (const [stack, meta] of Object.entries(STACK_META)) {
    const stackDir = join(NEW_CATALOG, stack);
    mkdirSync(stackDir, { recursive: true });
    writeFileSync(
      join(stackDir, 'stack.yaml'),
      stringifyYaml({ id: stack, ...meta }),
    );
  }

  for (const [domain, stack] of Object.entries(DOMAIN_STACK)) {
    const domainPath = join(OLD_CATALOG, domain, 'domain.yaml');
    const raw = parseYaml(readFileSync(domainPath, 'utf8')) as Record<string, unknown>;
    raw.stack = stack;
    const outDir = join(NEW_CATALOG, stack, 'domains', domain);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'domain.yaml'), stringifyYaml(raw));

    const groupsDir = join(OLD_CATALOG, domain, 'groups');
    for (const group of readdirSync(groupsDir)) {
      const groupPath = join(groupsDir, group, 'group.yaml');
      if (!statSync(groupPath).isFile()) continue;
      const groupOut = join(outDir, 'groups', group);
      mkdirSync(groupOut, { recursive: true });
      writeFileSync(join(groupOut, 'group.yaml'), readFileSync(groupPath, 'utf8'));
    }
  }

  // nestjs copy of testing-contracts domain (for nestjs-only rule)
  const testingDomain = parseYaml(readFileSync(join(OLD_CATALOG, 'testing-contracts/domain.yaml'), 'utf8')) as Record<string, unknown>;
  testingDomain.stack = 'nestjs';
  const nestjsTestingDir = join(NEW_CATALOG, 'nestjs/domains/testing-contracts');
  mkdirSync(nestjsTestingDir, { recursive: true });
  writeFileSync(join(nestjsTestingDir, 'domain.yaml'), stringifyYaml(testingDomain));
  const contractsGroup = join(OLD_CATALOG, 'testing-contracts/groups/contracts');
  mkdirSync(join(nestjsTestingDir, 'groups/contracts'), { recursive: true });
  writeFileSync(join(nestjsTestingDir, 'groups/contracts/group.yaml'), readFileSync(join(contractsGroup, 'group.yaml'), 'utf8'));

  for (const file of findRuleFiles(OLD_CATALOG)) {
    const raw = parseYaml(readFileSync(file, 'utf8')) as Record<string, unknown>;
    const oldId = raw.id as string;
    const mapping = SLUG_MAP[oldId];
    if (!mapping) throw new Error(`No mapping for ${oldId} in ${file}`);

    raw.id = mapping.id;
    raw.stack = mapping.stack;
    if (raw.replaced_by && typeof raw.replaced_by === 'string') raw.replaced_by = remapId(raw.replaced_by);
    if (Array.isArray(raw.related)) raw.related = raw.related.map((r) => (typeof r === 'string' ? remapId(r) : r));

    const domain = raw.domain as string;
    const group = raw.group as string;
    const outDir = join(NEW_CATALOG, mapping.stack, 'domains', domain, 'groups', group);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, `${mapping.id}.rule.yaml`), stringifyYaml(raw));
  }

  rmSync(OLD_CATALOG, { recursive: true, force: true });
  const idsPath = join(ROOT, 'registry/ids.json');
  try {
    unlinkSync(idsPath);
  } catch {
    // already gone
  }

  console.log('Restructured catalog to catalog/stacks/ with slug ids');
}

main();
