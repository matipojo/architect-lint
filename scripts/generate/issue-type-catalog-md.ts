/**
 * Generate catalog/issue-type-catalog.md from packages/codegen/issue-type-catalog.ts
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ISSUE_FAMILIES,
  ISSUE_FAMILY_LABELS,
  ISSUE_TYPE_CATALOG,
  ISSUE_TYPES_BY_FAMILY,
} from '../../packages/codegen/issue-type-catalog.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../../catalog/issue-type-catalog.md');

function formatList(items: readonly string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

function main() {
  const sections: string[] = [
    '# Issue type catalog',
    '',
    'Dictionary for **Why it matters** stake tags on principle records.',
    '',
    '**Source of truth:** `packages/codegen/issue-type-catalog.ts` (this file is generated — do not hand-edit).',
    '',
    'Each bullet names a **failure mode** if the rule is ignored — not the benefit of following it.',
    '',
    '## Families',
    '',
    ...ISSUE_FAMILIES.flatMap((family) => {
      const types = ISSUE_TYPES_BY_FAMILY[family];
      return [
        `### ${ISSUE_FAMILY_LABELS[family]}`,
        '',
        types.map((type) => `\`${type}\``).join(', '),
        '',
      ];
    }),
    '## External references',
    '',
    'Tags align with stakes found in:',
    '',
    '- OWASP Top 10 (Broken Access Control, Insecure Design, hardcoded secrets, multi-tenant isolation)',
    '- Microservices antipattern catalogs (Cerny et al. 2023; Taibi et al.; O\'Reilly pitfalls)',
    '- Distributed failure modes (cascading failure, gray failure, blast radius, omission/timeouts)',
    '- Test pyramid, contract testing, and deploy independence',
    '',
    '## Tag dictionary',
    '',
  ];

  for (const family of ISSUE_FAMILIES) {
    sections.push(`## ${ISSUE_FAMILY_LABELS[family]}`, '');

    for (const type of ISSUE_TYPES_BY_FAMILY[family]) {
      const entry = ISSUE_TYPE_CATALOG[type];
      sections.push(
        `### \`${type}\` — ${entry.label}`,
        '',
        entry.definition,
        '',
        '**Use when**',
        '',
        formatList(entry.useWhen),
        '',
        '**Not when**',
        '',
        formatList(entry.notWhen),
        '',
        '**Examples from catalog**',
        '',
        formatList(entry.examples),
        '',
        '**See also**',
        '',
        formatList(entry.externalRefs),
        '',
      );
    }
  }

  writeFileSync(OUT, `${sections.join('\n').trimEnd()}\n`);
  console.log(`  ✓ ${OUT.replace(`${join(__dirname, '../..')}/`, '')}`);
}

main();
