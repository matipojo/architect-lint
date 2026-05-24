<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { applyTheme, cycleTheme, getStoredTheme, resolveTheme, setStoredTheme, type Theme } from '../theme';
import { GITHUB_REPO, SITE_VERSION } from '../site';

const open = ref(false);
const theme = ref<Theme>('auto');
const resolved = ref<'light' | 'dark'>('light');
const rootRef = ref<HTMLElement | null>(null);

function syncTheme() {
  applyTheme(theme.value);
  resolved.value = resolveTheme(theme.value);
  setStoredTheme(theme.value);
}

function toggleTheme() {
  theme.value = cycleTheme(theme.value);
  syncTheme();
}

function onDocClick(event: MouseEvent) {
  if (!rootRef.value?.contains(event.target as Node)) {
    open.value = false;
  }
}

onMounted(() => {
  theme.value = getStoredTheme();
  syncTheme();
  document.addEventListener('click', onDocClick);

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onMedia = () => {
    if (theme.value === 'auto') syncTheme();
  };
  media.addEventListener('change', onMedia);
  onUnmounted(() => media.removeEventListener('change', onMedia));
});

onUnmounted(() => {
  document.removeEventListener('click', onDocClick);
});

const themeLabel =
  'Appearance: light / dark / auto';
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
      :aria-label="themeLabel"
      :title="themeLabel"
      @click="toggleTheme"
    >
      <svg v-if="resolved === 'dark'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    </button>

    <div ref="rootRef" class="arch-version-menu">
      <button
        type="button"
        class="arch-version-trigger"
        aria-haspopup="true"
        :aria-expanded="open"
        @click.stop="open = !open"
      >
        v{{ SITE_VERSION }}
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
        <a
          class="arch-version-item"
          :href="`https://github.com/${GITHUB_REPO}`"
          target="_blank"
          rel="noreferrer"
          role="menuitem"
        >
          GitHub
        </a>
      </div>
    </div>
  </div>
</template>
