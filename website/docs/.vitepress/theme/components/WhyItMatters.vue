<script setup lang="ts">
import { computed } from 'vue';

interface WhyItem {
  type: string;
  text: string;
}

const props = defineProps<{
  content: string;
  items?: WhyItem[];
}>();

const labels: Record<string, string> = {
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

function issueLabel(type: string): string {
  return labels[type] ?? type;
}

const fallbackItems = computed(() =>
  props.content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => ({ type: 'maintainability', text: line.slice(2) })),
);

const items = computed(() => (props.items?.length ? props.items : fallbackItems.value));
</script>

<template>
  <section v-if="items.length > 0" class="arch-panel arch-panel-solid why-section">
    <h2 id="why-it-matters" class="rule-section-title">Why it matters</h2>
    <ul class="issue-list">
      <li v-for="(item, index) in items" :key="`${item.type}-${index}`" class="issue-item">
        <span class="issue-tag" :class="`issue-tag-${item.type}`">{{ issueLabel(item.type) }}</span>
        <span class="issue-text">{{ item.text }}</span>
      </li>
    </ul>
  </section>
</template>
