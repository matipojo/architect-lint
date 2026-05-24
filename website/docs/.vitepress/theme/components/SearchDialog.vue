<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { withBase } from 'vitepress';
import rulesIndex from '../../../../src/data/rules-index.json';

type RuleIndexEntry = {
  id: string;
  stack: string;
  domain: string;
  title: string;
  summary: string;
  href: string;
};

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const rules = rulesIndex as RuleIndexEntry[];
const query = ref('');
const dialogRef = ref<HTMLDialogElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return rules.slice(0, 12);
  return rules
    .filter(
      (rule) =>
        rule.id.toLowerCase().includes(q) ||
        rule.title.toLowerCase().includes(q) ||
        rule.summary.toLowerCase().includes(q) ||
        rule.stack.toLowerCase().includes(q) ||
        rule.domain.toLowerCase().includes(q),
    )
    .slice(0, 12);
});

watch(
  () => props.open,
  async (isOpen) => {
    const dialog = dialogRef.value;
    if (!dialog) return;
    if (isOpen) {
      query.value = '';
      if (!dialog.open) dialog.showModal();
      await nextTick();
      inputRef.value?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  },
);

function handleClose() {
  emit('close');
}
</script>

<template>
  <dialog ref="dialogRef" class="arch-search-dialog" @close="handleClose" @click="(e) => e.target === dialogRef && handleClose()">
    <div class="arch-search-panel">
      <div class="arch-search-input-row">
        <input
          ref="inputRef"
          v-model="query"
          type="search"
          class="arch-search-input"
          placeholder="Search principles…"
          aria-label="Search principles"
        />
        <kbd class="arch-search-kbd">esc</kbd>
      </div>
      <ul class="arch-search-results">
        <li v-for="rule in results" :key="rule.id">
          <a :href="withBase(rule.href)" class="arch-search-result" @click="handleClose">
            <span class="arch-search-result-id">{{ rule.id }}</span>
            <span class="arch-search-result-title">{{ rule.title }}</span>
          </a>
        </li>
        <li v-if="results.length === 0" class="arch-search-empty">No results</li>
      </ul>
    </div>
  </dialog>
</template>
