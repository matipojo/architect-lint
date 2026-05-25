<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import NavActions from './components/NavActions.vue';
import SearchDialog from './components/SearchDialog.vue';
import { initMermaid } from './mermaid';

const { Layout } = DefaultTheme;
const route = useRoute();
const searchOpen = ref(false);

function onKeyDown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    searchOpen.value = !searchOpen.value;
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
  initMermaid();
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
});

watch(
  () => route.path,
  () => queueMicrotask(() => initMermaid()),
);
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <NavActions @open-search="searchOpen = true" />
    </template>
  </Layout>
  <SearchDialog :open="searchOpen" @close="searchOpen = false" />
</template>
