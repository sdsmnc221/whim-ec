<template>
  <div :class="$style.wrap">
    <WhimcCorners :accent="urgent ? 'var(--c-rouge)' : 'var(--c-sepia)'" />
    <div :class="[$style.inner, urgent && $style.urgent]">
      <div :class="$style.time">{{ fmtTime(secs) }}</div>

      <div :class="$style.barWrap">
        <div :class="$style.barTrack">
          <div :class="$style.barFill" :style="{ width: `${(answered / total) * 100}%` }" />
          <div v-for="p in [25, 50, 75]" :key="p" :class="$style.tick" :style="{ left: `${p}%` }" />
        </div>
      </div>

      <div :class="$style.count">{{ answered }}/{{ total }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { fmtTime } from "../../composables/useExamEngine";
import WhimcCorners from "../ui/WhimcCorners.vue";

const props = defineProps<{
  secs: number;
  answered: number;
  total: number;
}>();

const urgent = computed(() => props.secs < 5 * 60);
</script>

<style lang="scss" module>
@use "../../styles/tokens" as *;

.wrap {
  position: relative;
}

.inner {
  background-color: var(--c-craie);
  border: 1px dashed var(--c-sepia);
  padding: 0.55rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  &.urgent {
    border-color: var(--c-rouge);
  }
}

.time {
  font-family: var(--f-mono);
  font-size: 1.25rem;
  letter-spacing: 0.08em;
  color: var(--c-bleu);
  min-width: 50px;

  .urgent & {
    color: var(--c-rouge);
  }
}

.barWrap {
  flex: 1;
}

.barTrack {
  height: 4px;
  background: var(--c-linenD);
  position: relative;
}

.barFill {
  position: absolute;
  inset: 0;
  background: var(--c-bleu);
  transition: width 400ms;
}

.tick {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--c-sepia);
  opacity: 0.35;
}

.count {
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.9rem;
  color: var(--c-rouge);
}
</style>
