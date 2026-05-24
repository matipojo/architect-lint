<script setup lang="ts">
import domainsData from '../../../../src/data/domains.json';
import type { RulePageMeta } from '../../rule-data';

defineProps<{
  rule: RulePageMeta;
}>();

type DomainInfo = { id: string; stack: string; title: string };

const domains = domainsData as DomainInfo[];

function priorityLabel(priority: string): string {
  if (priority === 'critical') return 'Critical';
  if (priority === 'high') return 'High';
  if (priority === 'medium') return 'Medium';
  return 'Informational';
}

function stackLabel(stack: string): string {
  if (stack === 'nestjs') return 'NestJS';
  if (stack === 'react') return 'React';
  if (stack === 'nx') return 'Nx';
  return stack;
}

function domainLabel(stack: string, domain: string): string {
  return domains.find((d) => d.stack === stack && d.id === domain)?.title ?? domain;
}
</script>

<template>
  <header class="arch-panel rule-hero">
    <p class="rule-eyebrow">Architecture principle</p>
    <h1 class="rule-title">{{ rule.title }}</h1>
    <p class="rule-id"><code>{{ rule.id }}</code></p>
    <div class="principle-badges">
      <span class="principle-badge stack">{{ stackLabel(rule.stack) }}</span>
      <span class="principle-badge domain">{{ domainLabel(rule.stack, rule.domain) }}</span>
      <span class="principle-badge" :class="`severity-${rule.priority}`">
        {{ priorityLabel(rule.priority) }}
      </span>
      <span v-if="rule.status !== 'active'" class="principle-badge status">{{ rule.status }}</span>
    </div>
    <p v-if="rule.summary" class="rule-summary">{{ rule.summary }}</p>
  </header>
</template>
