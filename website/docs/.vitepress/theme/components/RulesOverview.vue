<script setup lang="ts">
import { computed } from 'vue';
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

const stackIcons: Record<string, string> = {
  nx: '⬡',
  react: '⚛',
  nestjs: '🐈',
};

function stackRuleCount(stackId: string): number {
  return stats.byStack[stackId] ?? 0;
}

function domainRuleCount(stack: string, domain: string): number {
  return rules.filter((r) => r.stack === stack && r.domain === domain).length;
}

function firstRuleHref(stack: string, domain?: string): string | null {
  const match = domain
    ? rules.find((r) => r.stack === stack && r.domain === domain)
    : rules.find((r) => r.stack === stack);
  return match ? withBase(match.href) : null;
}

function domainsForStack(stackId: string): DomainInfo[] {
  return domains.filter((d) => d.stack === stackId);
}

const stacksWithDomains = computed(() =>
  stacks.map((stack) => ({
    stack,
    domains: domainsForStack(stack.id),
  })),
);
</script>

<template>
  <div class="arch-overview">
    <p class="arch-overview-lead">
      Browse <strong>{{ stats.total }}</strong> architecture principles across
      <strong>Nx</strong>, <strong>React</strong>, and <strong>NestJS</strong>.
      Each rule lives in <code>catalog/stacks/**/*.rule.md</code> — this site is generated from those files.
      New here? See <a :href="withBase('/guide/getting-started')">Getting Started</a>.
    </p>

    <h2>Stacks</h2>
    <div class="arch-stack-grid">
      <a
        v-for="stack in stacks"
        :key="stack.id"
        :href="`#stack-${stack.id}`"
        class="arch-stack-card"
        :data-stack="stack.id"
      >
        <span class="arch-stack-card-icon" aria-hidden="true">{{ stackIcons[stack.id] ?? '◆' }}</span>
        <span class="arch-stack-card-title">{{ stack.title }}</span>
        <span class="arch-stack-card-count">{{ stackRuleCount(stack.id) }} principles</span>
        <span class="arch-stack-card-desc">{{ stack.description }}</span>
      </a>
    </div>

    <section
      v-for="{ stack, domains: stackDomains } in stacksWithDomains"
      :id="`stack-${stack.id}`"
      :key="stack.id"
      class="arch-domain-section"
    >
      <div class="arch-domain-section-header">
        <h2>{{ stack.title }} domains</h2>
        <span class="arch-domain-section-count">{{ stackRuleCount(stack.id) }} principles</span>
      </div>
      <div class="arch-domain-grid">
        <a
          v-for="domain in stackDomains"
          :key="`${domain.stack}/${domain.id}`"
          :href="firstRuleHref(domain.stack, domain.id) ?? undefined"
          class="arch-domain-card"
          :class="{ 'arch-domain-card-static': !firstRuleHref(domain.stack, domain.id) }"
        >
          <span class="arch-domain-card-title">{{ domain.title }}</span>
          <span class="arch-domain-card-count">
            {{ domainRuleCount(domain.stack, domain.id) }}
            {{ domainRuleCount(domain.stack, domain.id) === 1 ? 'principle' : 'principles' }}
          </span>
          <span class="arch-domain-card-desc">{{ domain.description }}</span>
        </a>
      </div>
    </section>
  </div>
</template>
