<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { withBase } from 'vitepress';
import showcaseData from '../../../../src/data/showcase-rules.json';
import statsData from '../../../../src/data/rule-stats.json';

type ShowcaseTab = {
  stack: string;
  title: string;
  rules: Array<{ id: string; title: string; summary: string; href: string }>;
};

type RuleStats = {
  total: number;
  byStack: Record<string, number>;
};

const showcase = showcaseData as ShowcaseTab[];
const stats = statsData as RuleStats;
const activeTab = ref(0);
const paused = ref(false);
let timer: number | undefined;

onMounted(() => {
  timer = window.setInterval(() => {
    if (!paused.value) activeTab.value = (activeTab.value + 1) % showcase.length;
  }, 8000);
});

onUnmounted(() => {
  if (timer) window.clearInterval(timer);
});

const activeRules = () => showcase[activeTab.value]?.rules ?? [];
</script>

<template>
  <section class="arch-features-section">
    <h2 style="text-align: center">Browse by stack</h2>
    <p style="text-align: center; color: var(--vp-c-text-2); margin-bottom: 1.5rem">
      {{ stats.total }} principles across {{ Object.keys(stats.byStack).length }} stacks
    </p>
    <div
      class="arch-features-tabs"
      @mouseenter="paused = true"
      @mouseleave="paused = false"
    >
      <button
        v-for="(tab, index) in showcase"
        :key="tab.stack"
        type="button"
        class="arch-features-tab"
        :class="{ active: index === activeTab }"
        @click="activeTab = index"
      >
        {{ tab.title }}
      </button>
    </div>
    <div class="arch-showcase-grid">
      <a
        v-for="rule in activeRules()"
        :key="rule.id"
        :href="withBase(rule.href)"
        class="arch-showcase-card"
      >
        <div class="arch-showcase-card-id">{{ rule.id }}</div>
        <div class="arch-showcase-card-title">{{ rule.title }}</div>
        <div class="arch-showcase-card-summary">{{ rule.summary }}</div>
      </a>
    </div>
  </section>
</template>
