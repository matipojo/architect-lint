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
  <header class="rule-hero">
    <h1 class="rule-title">{{ rule.title }}</h1>
    <p v-if="rule.summary" class="rule-lede">{{ rule.summary }}</p>
    <p class="rule-byline">
      <span>{{ stackLabel(rule.stack) }}</span>
      <span class="rule-byline-sep" aria-hidden="true">·</span>
      <span>{{ domainLabel(rule.stack, rule.domain) }}</span>
      <span class="rule-byline-sep" aria-hidden="true">·</span>
      <span class="rule-byline-priority" :class="`severity-${rule.priority}`">
        {{ priorityLabel(rule.priority) }}
      </span>
      <template v-if="rule.status !== 'active'">
        <span class="rule-byline-sep" aria-hidden="true">·</span>
        <span>{{ rule.status }}</span>
      </template>
    </p>
    <p class="rule-id"><code>{{ rule.id }}</code></p>
  </header>
</template>
