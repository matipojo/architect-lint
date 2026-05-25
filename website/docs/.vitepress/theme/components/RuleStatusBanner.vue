<script setup lang="ts">
import { withBase } from 'vitepress';
import type { RulePageMeta } from '../../rule-data';

defineProps<{
  rule: RulePageMeta;
}>();
</script>

<template>
  <div v-if="rule.status === 'deprecated' || rule.status === 'retired'" class="arch-panel rule-status-banner">
    {{ rule.status === 'retired' ? 'Retired' : 'Deprecated' }}
    <template v-if="rule.replaced_by">
      — replaced by
      <a :href="withBase(`/rules/${rule.replaced_by}`)">
        {{ rule.replaced_by }}
      </a>
    </template>
    <template v-else> — no longer recommended for new work</template>
  </div>
</template>
