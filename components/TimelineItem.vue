<template>
  <button :class="$style.item" :style="{ '--theme-c': themeColor }" @click="$emit('select')">
    <div :class="$style.year">
      {{ entry.year }}{{ entry.year_end ? `–${entry.year_end}` : "" }}
    </div>
    <div :class="$style.body">
      <span :class="$style.badge">{{ THEME_SHORT[entry.theme] ?? entry.theme }}</span>
      <p :class="$style.label">{{ entry.label }}</p>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { THEME_SHORT, THEME_COLOR } from "../utils/constants";
import type { TimelineEntry } from "../types/timeline";

const props = defineProps<{ entry: TimelineEntry }>();
defineEmits<{ select: [] }>();

const themeColor = computed(
  () => THEME_COLOR[props.entry.theme] ?? "var(--c-sepia)",
);
</script>

<style lang="scss" module>
@use "../styles/tokens" as *;

.item {
  display: grid;
  grid-template-columns: 4.5rem 1fr;
  gap: 0.75rem;
  width: 100%;
  text-align: left;
  background: var(--c-craie);
  border: 1px dashed var(--c-linenD);
  border-left: 3px solid var(--theme-c);
  padding: 0.75rem 0.85rem;
  cursor: pointer;
  transition: border-color 80ms ease-out, background 80ms ease-out;

  &:hover,
  &:focus-visible {
    background: var(--c-linen);
    border-left-color: var(--theme-c);
    outline: none;
  }
}

.year {
  font-family: var(--f-mono);
  font-size: 0.65rem;
  color: var(--theme-c);
  padding-top: 0.1rem;
  line-height: 1.4;
  flex-shrink: 0;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.badge {
  display: inline-block;
  font-family: var(--f-mono);
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--theme-c);
  border: 1px dashed var(--theme-c);
  padding: 0.1rem 0.4rem;
  align-self: flex-start;
  opacity: 0.75;
}

.label {
  font-family: var(--f-body);
  font-size: 0.85rem;
  line-height: 1.55;
  color: var(--c-encre);
  margin: 0;
}
</style>
