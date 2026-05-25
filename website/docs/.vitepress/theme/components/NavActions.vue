<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useData } from 'vitepress';
import { GITHUB_REPO, SITE_VERSION } from '../site';

const { isDark, theme } = useData();

const appearanceTitle = computed(() =>
  isDark.value
    ? theme.value.lightModeSwitchTitle || 'Switch to light theme'
    : theme.value.darkModeSwitchTitle || 'Switch to dark theme',
);

const versionLabel = computed(
  () => `Version v${SITE_VERSION}, releases and changelog`,
);

function toggleAppearance() {
  isDark.value = !isDark.value;
}

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);

function onDocClick(event: MouseEvent) {
  if (!rootRef.value?.contains(event.target as Node)) {
    open.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick);
});

onUnmounted(() => {
  document.removeEventListener('click', onDocClick);
});
</script>

<template>
  <div class="arch-nav-actions">
    <button
      type="button"
      class="arch-icon-btn"
      aria-label="Search principles"
      title="Search (Ctrl+K)"
      @click="$emit('open-search')"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    </button>

    <button
      type="button"
      class="arch-icon-btn"
      :title="appearanceTitle"
      :aria-label="appearanceTitle"
      @click="toggleAppearance"
    >
      <svg
        v-if="isDark"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg
        v-else
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>

    <div ref="rootRef" class="arch-version-menu">
      <button
        type="button"
        class="arch-version-trigger"
        aria-haspopup="true"
        :aria-expanded="open"
        :aria-label="versionLabel"
        @click.stop="open = !open"
      >
        <span class="arch-version-label">v{{ SITE_VERSION }}</span>
        <svg
          class="arch-version-chevron"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div v-if="open" class="arch-version-panel" role="menu">
        <a
          class="arch-version-item"
          :href="`https://github.com/${GITHUB_REPO}/releases`"
          target="_blank"
          rel="noreferrer"
          role="menuitem"
        >
          Releases
        </a>
        <a
          class="arch-version-item"
          :href="`https://github.com/${GITHUB_REPO}/blob/main/CHANGELOG.md`"
          target="_blank"
          rel="noreferrer"
          role="menuitem"
        >
          Changelog
        </a>
      </div>
    </div>

    <a
      class="arch-icon-btn"
      :href="`https://github.com/${GITHUB_REPO}`"
      target="_blank"
      rel="noreferrer"
      aria-label="View on GitHub"
      title="View on GitHub"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
        />
      </svg>
    </a>
  </div>
</template>
