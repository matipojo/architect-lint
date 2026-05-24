<script setup lang="ts">
defineProps<{
  editUrl: string;
}>();
</script>

<template>
  <footer class="rule-page-footer">
    <a :href="editUrl" target="_blank" rel="noreferrer" class="rule-edit-link">
      Edit this page on GitHub
    </a>
  </footer>
</template>
