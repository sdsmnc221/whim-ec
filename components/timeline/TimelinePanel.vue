<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="entry" :class="$style.overlay" @click.self="$emit('close')" />
    </Transition>
    <Transition name="slide-up">
      <div v-if="entry" :class="$style.panel" role="dialog" aria-modal="true">
        <div :class="$style.handle" />

        <div :class="$style.header">
          <span :class="$style.year">
            {{ entry.year }}{{ entry.year_end ? `–${entry.year_end}` : "" }}
          </span>
          <button :class="$style.closeBtn" @click="$emit('close')">×</button>
        </div>

        <div :class="$style.body">
          <p
            v-for="(exp, i) in entry.explications"
            :key="i"
            :class="$style.explication"
          >
            {{ exp }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from "vue";
import type { TimelineEntry } from "../../types/timeline";

const props = defineProps<{ entry: TimelineEntry | null }>();
defineEmits<{ close: [] }>();

watch(
  () => props.entry,
  (val) => {
    if (!import.meta.client) return;
    document.body.style.overflow = val ? "hidden" : "";
  },
);
</script>

<style lang="scss" module>
@use "../../styles/tokens" as *;

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.4);
  z-index: 50;
}

.panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 75vh;
  overflow-y: auto;
  z-index: 51;
  background: var(--c-craie);
  border-top: 1px dashed var(--c-sepia);
  padding: 0 1.25rem 2.5rem;
}

.handle {
  width: 2.5rem;
  height: 3px;
  background: var(--c-linenD);
  border-radius: 2px;
  margin: 0.75rem auto 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.75rem 0 0.65rem;
  border-bottom: 1px dashed var(--c-linenD);
  margin-bottom: 1rem;
}

.year {
  font-family: var(--f-display);
  font-size: 1.4rem;
  color: var(--c-encre);
}

.closeBtn {
  background: none;
  border: 1px dashed var(--c-sepia);
  color: var(--c-sepia);
  font-family: var(--f-mono);
  font-size: 1rem;
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    border-color: var(--c-rouge);
    color: var(--c-rouge);
  }
}

.body {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.explication {
  font-family: var(--f-body);
  font-size: 0.92rem;
  line-height: 1.7;
  color: var(--c-encre);
  margin: 0;
}
</style>
