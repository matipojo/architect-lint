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
    <div class="rule-meta-header">
      <h2 id="resources" class="rule-section-title">Resources</h2>
      <p class="rule-meta-since">Available since {{ since }}</p>
    </div>
    <div class="rule-meta-actions">
      <a
        class="resource-icon-btn"
        :href="resources.viewSource"
        target="_blank"
        rel="noreferrer"
        aria-label="View source — catalog rule file"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
        <span class="resource-icon-tooltip">View source</span>
      </a>
      <a
        class="resource-icon-btn"
        :href="resources.suggestChange"
        target="_blank"
        rel="noreferrer"
        aria-label="Suggest change — edit on GitHub"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        <span class="resource-icon-tooltip">Suggest change</span>
      </a>
      <a
        class="resource-icon-btn"
        :href="resources.discuss"
        target="_blank"
        rel="noreferrer"
        aria-label="Discuss — open an issue"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span class="resource-icon-tooltip">Discuss</span>
      </a>
      <a
        class="resource-icon-btn"
        :href="resources.permalink"
        target="_blank"
        rel="noreferrer"
        aria-label="Permalink — stable review link"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span class="resource-icon-tooltip">Permalink</span>
      </a>
    </div>
  </section>
</template>
