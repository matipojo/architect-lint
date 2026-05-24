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
  <section class="arch-showcase">
    <header class="arch-showcase-header">
      <h2 class="arch-showcase-heading">Browse by stack</h2>
      <p class="arch-showcase-lead">
        {{ stats.total }} principles across {{ Object.keys(stats.byStack).length }} stacks
      </p>
    </header>

    <div
      class="arch-showcase-tabs"
      role="tablist"
      aria-label="Filter by stack"
      @mouseenter="paused = true"
      @mouseleave="paused = false"
    >
      <button
        v-for="(tab, index) in showcase"
        :key="tab.stack"
        type="button"
        role="tab"
        class="arch-showcase-tab"
        :class="{ active: index === activeTab }"
        :aria-selected="index === activeTab"
        @click="activeTab = index"
      >
        {{ tab.title }}
      </button>
    </div>

    <div class="arch-showcase-grid" :key="activeTab">
      <a
        v-for="rule in activeRules()"
        :key="rule.id"
        :href="withBase(rule.href)"
        class="arch-showcase-card"
      >
        <h3 class="arch-showcase-card-title">{{ rule.title }}</h3>
        <p class="arch-showcase-card-summary">{{ rule.summary }}</p>
        <span class="arch-showcase-card-cta">Read principle</span>
      </a>
    </div>
  </section>
</template>
