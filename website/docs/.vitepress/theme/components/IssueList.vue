<script setup lang="ts">
defineProps<{
  issues: Array<{ type: string; text: string }>;
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
</script>

<template>
  <section v-if="issues.length > 0" class="issue-section">
    <h2 id="issues">Issues</h2>
    <ul class="issue-list">
      <li v-for="(issue, index) in issues" :key="`${issue.type}-${index}`" class="issue-item">
        <span class="issue-tag" :class="`issue-tag-${issue.type}`">{{ issueLabel(issue.type) }}</span>
        <span class="issue-text">{{ issue.text }}</span>
      </li>
    </ul>
  </section>
</template>
