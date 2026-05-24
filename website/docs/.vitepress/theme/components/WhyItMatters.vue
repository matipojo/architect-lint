<script setup lang="ts">
import { computed } from 'vue';
import { ISSUE_TYPE_LABELS, issueTypeLabel, type IssueType } from '../../../../../packages/codegen/issue-types.ts';
import { renderInlineMarkdown } from '../utils/inline-markdown.ts';

interface WhyItem {
  type: string;
  text: string;
}

interface WhyGroup {
  type: string;
  texts: string[];
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

function groupItems(items: WhyItem[]): WhyGroup[] {
  const groups: WhyGroup[] = [];

  for (const item of items) {
    const last = groups.at(-1);
    if (last?.type === item.type) {
      last.texts.push(item.text);
      continue;
    }

    groups.push({ type: item.type, texts: [item.text] });
  }

  return groups;
}

const fallbackItems = computed(() =>
  props.content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => ({ type: 'agent-gets-lost', text: line.slice(2) })),
);

const items = computed(() => (props.items?.length ? props.items : fallbackItems.value));
const groups = computed(() => groupItems(items.value));

const summary = computed(() => {
  const total = items.value.length;
  if (total < 3) return null;

  const counts = new Map<string, number>();
  for (const group of groups.value) {
    counts.set(group.type, (counts.get(group.type) ?? 0) + group.texts.length);
  }

  return [...counts.entries()]
    .map(([type, count]) => `${count} ${issueLabel(type).toLowerCase()}`)
    .join(', ');
});
</script>

<template>
  <section v-if="groups.length > 0" class="why-section">
    <h2 id="why-it-matters" class="rule-section-title">Why it matters</h2>
    <p v-if="summary" class="why-summary">{{ summary }}</p>
    <ul class="issue-list">
      <li v-for="(group, index) in groups" :key="`${group.type}-${index}`" class="issue-item">
        <span class="issue-tag" :class="`issue-tag-${group.type}`">{{ issueLabel(group.type) }}</span>
        <div class="issue-texts" :class="{ 'issue-texts-multiple': group.texts.length > 1 }">
          <p
            v-for="(text, textIndex) in group.texts"
            :key="textIndex"
            class="issue-text"
            v-html="renderInlineMarkdown(text)"
          />
        </div>
      </li>
    </ul>
  </section>
</template>
