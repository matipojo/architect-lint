import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import {
  DomainSchema,
  GroupSchema,
  StackManifestSchema,
  RULE_ID_REGEX,
} from '../../packages/codegen/schema.js';
import { parseRuleMarkdown } from '../../packages/codegen/parse-rule-md.js';
import {
  catalogRoot,
  domainCatalogPath,
  groupCatalogPath,
  ruleCatalogPath,
  STACKS,
  type Stack,
} from '../../packages/codegen/catalog-meta.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const MAX_GROUP_SIZE = 20;

function findRuleFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findRuleFiles(full));
    } else if (entry.endsWith('.rule.md')) {
      results.push(full);
    }
  }
  return results;
}

function relativeCatalogPath(absPath: string): string {
  return absPath.slice(ROOT.length + 1);
}

export function validateCatalog(): string[] {
  const errors: string[] = [];
  const stacksDir = join(ROOT, catalogRoot());

  if (!statSync(stacksDir).isDirectory()) {
    return [`${catalogRoot()}/ not found`];
  }

  for (const stack of STACKS) {
    const stackPath = join(stacksDir, stack, 'stack.yaml');
    if (!existsSync(stackPath)) {
      errors.push(`Missing ${relativeCatalogPath(stackPath)}`);
      continue;
    }
    try {
      StackManifestSchema.parse(parseYaml(readFileSync(stackPath, 'utf8')));
    } catch (e) {
      errors.push(`${relativeCatalogPath(stackPath)}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const ruleFiles = findRuleFiles(stacksDir);
  const ids = new Set<string>();
  const groupCounts = new Map<string, number>();

  for (const file of ruleFiles) {
    const filename = basename(file, '.rule.md');
    const rel = relativeCatalogPath(file);

    if (!RULE_ID_REGEX.test(filename)) {
      errors.push(`${rel}: filename must be a kebab-case slug matching rule id`);
    }

    try {
      const rule = parseRuleMarkdown(readFileSync(file, 'utf8'), rel);

      if (rule.id !== filename) {
        errors.push(`${rel}: id "${rule.id}" does not match filename "${filename}"`);
      }

      const expectedPath = join(
        ROOT,
        ruleCatalogPath(rule.stack, rule.domain, rule.group, rule.id),
      );
      if (file !== expectedPath) {
        errors.push(
          `${rel}: expected at ${ruleCatalogPath(rule.stack, rule.domain, rule.group, rule.id)}`,
        );
      }

      if (ids.has(rule.id)) {
        errors.push(`Duplicate rule ID: ${rule.id}`);
      }
      ids.add(rule.id);

      const groupKey = `${rule.stack}/${rule.domain}/${rule.group}`;
      groupCounts.set(groupKey, (groupCounts.get(groupKey) ?? 0) + 1);

      const domainPath = join(ROOT, domainCatalogPath(rule.stack as Stack, rule.domain));
      if (!existsSync(domainPath)) {
        errors.push(`${rel}: missing ${domainCatalogPath(rule.stack as Stack, rule.domain)}`);
      } else {
        const domain = DomainSchema.parse(parseYaml(readFileSync(domainPath, 'utf8')));
        if (domain.stack !== rule.stack) {
          errors.push(`${rel}: rule stack "${rule.stack}" does not match domain stack "${domain.stack}"`);
        }
      }

      const groupPath = join(ROOT, groupCatalogPath(rule.stack as Stack, rule.domain, rule.group));
      if (!existsSync(groupPath)) {
        errors.push(`${rel}: missing ${groupCatalogPath(rule.stack as Stack, rule.domain, rule.group)}`);
      } else {
        GroupSchema.parse(parseYaml(readFileSync(groupPath, 'utf8')));
      }
    } catch (e) {
      errors.push(`${rel}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  for (const [group, count] of groupCounts) {
    if (count > MAX_GROUP_SIZE) {
      errors.push(`Group ${group} has ${count} rules (max ${MAX_GROUP_SIZE})`);
    }
  }

  for (const file of ruleFiles) {
    try {
      const rule = parseRuleMarkdown(readFileSync(file, 'utf8'), rel);
      for (const relatedId of rule.related) {
        if (!ids.has(relatedId)) {
          errors.push(`${relativeCatalogPath(file)}: related rule "${relatedId}" not found in catalog`);
        }
      }
      if (rule.replaced_by && !ids.has(rule.replaced_by)) {
        errors.push(
          `${relativeCatalogPath(file)}: replaced_by "${rule.replaced_by}" not found in catalog`,
        );
      }
    } catch {
      // parse errors already reported above
    }
  }

  return errors;
}
