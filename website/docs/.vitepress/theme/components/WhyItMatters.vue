<script setup lang="ts">
import { computed } from 'vue';
import { ISSUE_TYPE_LABELS, issueTypeLabel, type IssueType } from '../../../../../packages/codegen/issue-types.ts';

interface WhyItem {
  type: string;
  text: string;
}

const props = defineProps<{
  content: string;
  items?: WhyItem[];
}>();

function issueLabel(type: string): string {
  if (type in ISSUE_TYPE_LABELS) {
    return issueTypeLabel(type as IssueType);
  }
  return type;
}

const fallbackItems = computed(() =>
  props.content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => ({ type: 'agent-gets-lost', text: line.slice(2) })),
);

const items = computed(() => (props.items?.length ? props.items : fallbackItems.value));
</script>

<template>
  <section v-if="items.length > 0" class="why-section">
    <h2 id="why-it-matters" class="rule-section-title">Why it matters</h2>
    <ul class="issue-list">
      <li v-for="(item, index) in items" :key="`${item.type}-${index}`" class="issue-item">
        <span class="issue-tag" :class="`issue-tag-${item.type}`">{{ issueLabel(item.type) }}</span>
        <span class="issue-text">{{ item.text }}</span>
      </li>
    </ul>
  </section>
</template>
