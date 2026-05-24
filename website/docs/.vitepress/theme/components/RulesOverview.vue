<script setup lang="ts">
import { withBase } from 'vitepress';
import domainsData from '../../../../src/data/domains.json';
import stacksData from '../../../../src/data/stacks.json';
import rulesIndex from '../../../../src/data/rules-index.json';
import statsData from '../../../../src/data/rule-stats.json';

type DomainInfo = { id: string; stack: string; title: string; description: string };
type StackInfo = { id: string; title: string; description: string };
type RuleIndexEntry = { id: string; stack: string; domain: string; href: string };
type RuleStats = { total: number; byStack: Record<string, number> };

const domains = domainsData as DomainInfo[];
const stacks = stacksData as StackInfo[];
const rules = rulesIndex as RuleIndexEntry[];
const stats = statsData as RuleStats;
</script>

<template>
  <p>
    Browse <strong>{{ stats.total }}</strong> professional architecture principles scoped to
    <strong>Nx</strong>, <strong>React</strong>, and <strong>NestJS</strong>.
  </p>
  <p>
    Each principle lives in <code>catalog/stacks/**/*.rule.md</code> — the single source of truth.
    This site is generated from those files.
  </p>

  <h2>Stacks</h2>
  <table>
    <thead>
      <tr>
        <th>Stack</th>
        <th>Focus</th>
        <th>Rules</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="stack in stacks" :key="stack.id">
        <td>
          <a v-if="rules.find((r) => r.stack === stack.id)" :href="withBase(rules.find((r) => r.stack === stack.id)!.href)">
            {{ stack.title }}
          </a>
          <template v-else>{{ stack.title }}</template>
        </td>
        <td>{{ stack.description }}</td>
        <td>{{ stats.byStack[stack.id] ?? 0 }}</td>
      </tr>
    </tbody>
  </table>

  <h2>Domains</h2>
  <table>
    <thead>
      <tr>
        <th>Stack</th>
        <th>Domain</th>
        <th>Focus</th>
        <th>Rules</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="domain in domains" :key="`${domain.stack}/${domain.id}`">
        <td>{{ domain.stack }}</td>
        <td>
          <a
            v-if="rules.find((r) => r.stack === domain.stack && r.domain === domain.id)"
            :href="withBase(rules.find((r) => r.stack === domain.stack && r.domain === domain.id)!.href)"
          >
            {{ domain.title }}
          </a>
          <template v-else>{{ domain.title }}</template>
        </td>
        <td>{{ domain.description }}</td>
        <td>{{ rules.filter((r) => r.stack === domain.stack && r.domain === domain.id).length }}</td>
      </tr>
    </tbody>
  </table>

  <h2>Using in your repo</h2>
  <p>Add <code>.architect-lint.yaml</code>:</p>
  <pre><code>stacks:
  - nx
  - nestjs
scope: changed
preset: recommended</code></pre>
  <p>Then run <code>/architect-lint-review</code> in Cursor or Claude.</p>
</template>
