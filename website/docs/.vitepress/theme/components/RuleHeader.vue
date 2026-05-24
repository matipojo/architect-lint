<script setup lang="ts">
import type { RulePageMeta } from '../../rule-data';

defineProps<{
  rule: RulePageMeta;
}>();

function priorityLabel(priority: string): string {
  if (priority === 'critical') return 'Critical';
  if (priority === 'high') return 'High';
  if (priority === 'medium') return 'Medium';
  return 'Informational';
}
</script>

<template>
  <p class="principle-title">{{ rule.title }}</p>
  <div class="principle-badges">
    <span class="principle-badge" :class="`severity-${rule.priority}`">
      {{ priorityLabel(rule.priority) }}
    </span>
    <span v-if="rule.status !== 'active'" class="principle-badge">{{ rule.status }}</span>
  </div>
</template>
