<script setup lang="ts">
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import { computed, nextTick, ref, watch } from 'vue';
import { withBase } from 'vitepress';
import rulesIndex from '../../../../src/data/rules-index.json';
import domainsData from '../../../../src/data/domains.json';

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
const domainTitles = new Map(
  (domainsData as Array<{ stack: string; id: string; title: string }>).map((d) => [
    `${d.stack}/${d.id}`,
    d.title,
  ]),
);
const query = ref('');
const dialogRef = ref<HTMLDialogElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

const { activate, deactivate } = useFocusTrap(panelRef, {
  allowOutsideClick: true,
  clickOutsideDeactivates: true,
  escapeDeactivates: true,
});

function searchScore(rule: RuleIndexEntry, q: string): number {
  const id = rule.id.toLowerCase();
  const title = rule.title.toLowerCase();
  const summary = rule.summary.toLowerCase();
  const stack = rule.stack.toLowerCase();
  const domain = rule.domain.toLowerCase();

  if (title === q) return 100;
  if (id === q) return 95;
  if (title.startsWith(q)) return 90;
  if (id.startsWith(q)) return 85;
  if (title.includes(q)) return 80;
  if (id.includes(q)) return 70;
  if (stack.includes(q) || domain.includes(q)) return 55;
  if (summary.includes(q)) return 45;
  return 0;
}

function stackLabel(stack: string): string {
  if (stack === 'nestjs') return 'NestJS';
  if (stack === 'react') return 'React';
  if (stack === 'nx') return 'Nx';
  return stack;
}

function domainLabel(stack: string, domain: string): string {
  return domainTitles.get(`${stack}/${domain}`) ?? domain;
}

const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return rules.slice(0, 12);
  return rules
    .map((rule) => ({ rule, score: searchScore(rule, q) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.rule.title.localeCompare(b.rule.title))
    .slice(0, 12)
    .map(({ rule }) => rule);
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
      activate();
      inputRef.value?.focus();
    } else {
      deactivate();
      if (dialog.open) dialog.close();
    }
  },
);

function handleClose() {
  emit('close');
}
</script>

<template>
  <dialog ref="dialogRef" class="arch-search-dialog" @close="handleClose" @click="(e) => e.target === dialogRef && handleClose()">
    <div ref="panelRef" class="arch-search-panel">
      <div class="arch-search-input-row">
        <input
          ref="inputRef"
          v-model="query"
          type="search"
          class="arch-search-input"
          placeholder="Search by title, stack, or principle id…"
          aria-label="Search principles"
        />
        <kbd class="arch-search-kbd">esc</kbd>
      </div>
      <ul class="arch-search-results">
        <li v-for="rule in results" :key="rule.id">
          <a :href="withBase(rule.href)" class="arch-search-result" @click="handleClose">
            <span class="arch-search-result-title">{{ rule.title }}</span>
            <span class="arch-search-result-meta">
              <span class="arch-search-badge">{{ stackLabel(rule.stack) }}</span>
              <span class="arch-search-badge">{{ domainLabel(rule.stack, rule.domain) }}</span>
            </span>
            <span class="arch-search-result-id">{{ rule.id }}</span>
            <span v-if="rule.summary" class="arch-search-result-summary">{{ rule.summary }}</span>
          </a>
        </li>
        <li v-if="results.length === 0" class="arch-search-empty">No matching principles</li>
      </ul>
    </div>
  </dialog>
</template>
