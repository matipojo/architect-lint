<script setup lang="ts">
import { computed } from 'vue';
import rulesIndex from '../../../../src/data/rules-index.json';
import type { RuleRelated } from '../../rule-data';

const props = defineProps<{
  related: RuleRelated[];
}>();

type IndexEntry = { id: string; stack: string; title: string; href: string };

const index = rulesIndex as IndexEntry[];

function stackLabel(stack: string): string {
  if (stack === 'nestjs') return 'NestJS';
  if (stack === 'react') return 'React';
  if (stack === 'nx') return 'Nx';
  return stack;
}

const items = computed(() =>
  props.related.map((item) => {
    const entry = index.find((rule) => rule.id === item.id);
    return {
      id: item.id,
      stack: item.stack ?? entry?.stack ?? '',
      href: item.href ?? entry?.href ?? `/rules/${item.id}`,
      title: entry?.title ?? item.id,
    };
  }),
);
</script>

<template>
  <section v-if="items.length > 0" class="arch-panel arch-panel-solid rule-related">
    <h2 id="related-principles" class="rule-section-title">Related principles</h2>
    <ul class="rule-related-list">
      <li v-for="item in items" :key="item.id" class="rule-related-item">
        <a :href="item.href" class="rule-related-link">
          <span class="rule-related-title">{{ item.title }}</span>
          <span class="rule-related-meta">
            <span v-if="item.stack" class="principle-badge stack">{{ stackLabel(item.stack) }}</span>
            <code>{{ item.id }}</code>
          </span>
        </a>
      </li>
    </ul>
  </section>
</template>
