<script setup lang="ts">
import { onMounted, ref } from 'vue';

const command = '/architect-lint-review --explain';
const outputLines = [
  { type: 'error', text: "❌ nestjs-realtime-transport-sse-vs-websocket — Pick one mechanism per flow — don't confuse SSE with WebSocket" },
  { type: 'link', text: '   https://matipojo.github.io/architect-lint/rules/nestjs-realtime-transport-sse-vs-websocket' },
  { type: 'dim', text: '   File: src/chat/chat.gateway.ts:8' },
  { type: 'dim', text: '   Problem: WebSocket for one-way LLM token stream' },
  { type: 'dim', text: '   Fix: Use SSE for server→client streaming' },
  { type: 'dim', text: '   Rationale: WebSocket overhead for one-way streams wastes ops budget.' },
  { type: 'success', text: '✓ 49 other principles passed' },
];

const typedText = ref('');
const showCursor = ref(true);
const visibleLines = ref<typeof outputLines>([]);

onMounted(() => {
  let i = 0;
  const typeInterval = window.setInterval(() => {
    if (i <= command.length) {
      typedText.value = command.slice(0, i);
      i++;
    } else {
      window.clearInterval(typeInterval);
      showCursor.value = false;
      outputLines.forEach((line, idx) => {
        window.setTimeout(() => {
          visibleLines.value = [...visibleLines.value, line];
        }, 200 * (idx + 1));
      });
    }
  }, 40);
});
</script>

<template>
  <div class="arch-terminal">
    <div class="arch-terminal-chrome">
      <div class="arch-terminal-dots">
        <span />
        <span />
        <span />
      </div>
      <span class="arch-terminal-title">Terminal</span>
    </div>
    <div class="arch-terminal-body">
      <div class="arch-terminal-line input">
        <span>$</span> {{ typedText }}<span v-if="showCursor" class="arch-terminal-cursor" />
      </div>
      <div v-for="(line, index) in visibleLines" :key="index" class="arch-terminal-line" :class="line.type">
        {{ line.text }}
      </div>
    </div>
  </div>
</template>
