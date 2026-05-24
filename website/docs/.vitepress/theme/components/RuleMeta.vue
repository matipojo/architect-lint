<script setup lang="ts">
defineProps<{
  resources: {
    permalink: string;
    viewSource: string;
    suggestChange: string;
    discuss: string;
  };
  since: string;
}>();
</script>

<template>
  <section class="arch-panel arch-panel-solid rule-meta">
    <h2 id="resources" class="rule-section-title">Resources</h2>
    <div class="rule-meta-grid">
      <a class="rule-meta-link" :href="resources.viewSource" target="_blank" rel="noreferrer">
        <span class="rule-meta-label">View source</span>
        <span class="rule-meta-hint">Catalog `.rule.md`</span>
      </a>
      <a class="rule-meta-link" :href="resources.suggestChange" target="_blank" rel="noreferrer">
        <span class="rule-meta-label">Suggest change</span>
        <span class="rule-meta-hint">Edit on GitHub</span>
      </a>
      <a class="rule-meta-link" :href="resources.discuss" target="_blank" rel="noreferrer">
        <span class="rule-meta-label">Discuss</span>
        <span class="rule-meta-hint">Open an issue</span>
      </a>
      <a class="rule-meta-link" :href="resources.permalink">
        <span class="rule-meta-label">Permalink</span>
        <span class="rule-meta-hint">Stable review link</span>
      </a>
    </div>
    <p class="rule-meta-since">Available since {{ since }}</p>
    <a :href="resources.suggestChange" target="_blank" rel="noreferrer" class="rule-edit-link">
      Edit this page on GitHub
    </a>
  </section>
</template>
