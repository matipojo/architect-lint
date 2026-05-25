<script setup lang="ts">
defineProps<{
  since: string;
}>();
</script>

<template>
  <section>
    <h2 id="version">Version</h2>
    <p>Available since: {{ since }}</p>
  </section>
</template>
