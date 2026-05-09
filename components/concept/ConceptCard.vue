<template>
  <button
    :class="$style.card"
    :style="{ '--theme-c': themeColor }"
    @click="$emit('open')"
  >
    <div :class="$style.header">
      <span :class="$style.title">{{ concept.title }}</span>
      <span v-if="progress.bookmarked" :class="$style.bookmarkIcon">◆</span>
    </div>
    <p :class="$style.def">{{ concept.definition.replace(/\*\*/g, "") }}</p>
    <div :class="$style.footer">
      <span :class="$style.badge">{{
        THEME_SHORT[concept.themes[0]] ?? concept.themes[0]
      }}</span>
      <span v-if="progress.seen" :class="$style.seenBadge">vu</span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { THEME_SHORT, THEME_COLOR } from "../../utils/constants";
import type { ConceptEntry, ConceptProgress } from "../../types/concept";

const props = defineProps<{
  concept: ConceptEntry;
  progress: ConceptProgress;
}>();
defineEmits<{ open: [] }>();

const themeColor = computed(
  () => THEME_COLOR[props.concept.themes[0]] ?? "var(--c-encre)",
);
</script>

<style lang="scss" module>
@use "../../styles/tokens" as *;

.card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  text-align: left;
  background: var(--c-craie);
  border: 1px dashed var(--c-linenD);
  border-left: 3px solid var(--theme-c);
  padding: 0.75rem 0.85rem;
  cursor: pointer;
  transition:
    border-color 80ms ease-out,
    background 80ms ease-out;

  &:hover,
  &:focus-visible {
    background: var(--c-linen);
    outline: none;
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.title {
  font-family: var(--f-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--c-encre);
}

.bookmarkIcon {
  color: var(--theme-c);
  font-size: 0.65rem;
  flex-shrink: 0;
}

.def {
  font-family: var(--f-body);
  font-size: 0.8rem;
  line-height: 1.55;
  color: var(--c-encre);
  margin: 0;
  opacity: 0.75;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
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
  opacity: 0.75;
}

.seenBadge {
  font-family: var(--f-mono);
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-encre);
  opacity: 0.4;
}
</style>
