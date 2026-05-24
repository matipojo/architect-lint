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

function groupByType(items: WhyItem[]): WhyGroup[] {
  const order: string[] = [];
  const textsByType = new Map<string, string[]>();

  for (const item of items) {
    if (!textsByType.has(item.type)) {
      order.push(item.type);
      textsByType.set(item.type, []);
    }
    textsByType.get(item.type)!.push(item.text);
  }

  return order.map((type) => ({ type, texts: textsByType.get(type)! }));
}

const fallbackItems = computed(() =>
  props.content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => ({ type: 'agent-gets-lost', text: line.slice(2) })),
);

const items = computed(() => (props.items?.length ? props.items : fallbackItems.value));
const groups = computed(() => groupByType(items.value));
</script>

<template>
  <section v-if="groups.length > 0" class="why-section">
    <h2 id="why-it-matters" class="rule-section-title">Why it matters</h2>
    <table class="issue-table">
      <caption class="issue-table-caption">Failure modes if this rule is ignored</caption>
      <thead>
        <tr>
          <th scope="col">Stake</th>
          <th scope="col">If ignored</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="group in groups"
          :key="group.type"
          class="issue-row"
          :class="`issue-row-${group.type}`"
        >
          <th scope="row" class="issue-stake">
            <span class="issue-tag" :class="`issue-tag-${group.type}`">{{ issueLabel(group.type) }}</span>
          </th>
          <td class="issue-consequences-cell">
            <ul class="issue-consequences">
              <li
                v-for="(text, textIndex) in group.texts"
                :key="textIndex"
                class="issue-consequence"
              >
                <span class="issue-consequence-text" v-html="renderInlineMarkdown(text)" />
              </li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
