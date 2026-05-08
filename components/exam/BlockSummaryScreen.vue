<template>
  <div :class="$style.screen">
    <CrossStitch :color="accent" :count="12" :seed="blockIndex * 13 + 7" />

    <div :class="$style.container">
      <div :class="$style.blockLabel">
        Bloc {{ blockIndex + 1 }} / {{ totalBlocks }}
      </div>

      <div :class="$style.scoreWrap">
        <WhimcCorners :accent="accent" />
        <div :class="$style.scoreBox">
          <CrossStitch :color="accent" :count="6" :seed="42" />
          <div :class="$style.scoreNum" :style="{ color: accent }">
            {{ correct }}
          </div>
          <div :class="$style.scoreSub">sur {{ total }} · {{ pct }}%</div>
          <WhimcStamp
            :color="accent"
            :angle="passed ? -1.5 : 2"
            :class="$style.stamp"
          >
            {{ passed ? "× bloc réussi" : "× bloc raté" }}
          </WhimcStamp>
        </div>
      </div>

      <div :class="$style.nextInfo">
        bloc suivant · {{ total }} nouvelles questions · 45 min
      </div>

      <WhimcBtn variant="primary" :class="$style.continueBtn" @click="$emit('continue')">
        bloc suivant →
      </WhimcBtn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { PASS_THRESHOLD } from "../../composables/useExamEngine";
import CrossStitch from "../ui/CrossStitch.vue";
import WhimcCorners from "../ui/WhimcCorners.vue";
import WhimcStamp from "../ui/WhimcStamp.vue";
import WhimcBtn from "../ui/WhimcBtn.vue";

const props = defineProps<{
  blockIndex: number;
  totalBlocks: number;
  correct: number;
  total: number;
}>();

defineEmits<{ continue: [] }>();

const pct = computed(() => Math.round((props.correct / props.total) * 100));
const passed = computed(() => props.correct / props.total >= PASS_THRESHOLD);
const accent = computed(() =>
  passed.value ? "var(--c-vert)" : "var(--c-rouge)",
);
</script>

<style lang="scss" module>
@use "../../styles/tokens" as *;

.screen {
  position: relative;
  min-height: 100vh;
  padding: 2rem 1.25rem 4rem;
  font-family: var(--f-mono);
  color: var(--c-encre);
  @include linen-bg;
}

.container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.75rem;
  padding-top: 2rem;
}

.blockLabel {
  font-family: var(--f-mono);
  font-size: 0.55rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--c-sepia);
}

.scoreWrap {
  position: relative;
  width: 100%;
}

.scoreBox {
  background-color: var(--c-craie);
  border: 1px dashed var(--c-sepia);
  padding: 2rem 1rem 1.5rem;
  text-align: center;
  overflow: hidden;
  position: relative;
}

.scoreNum {
  font-family: var(--f-display);
  font-size: 4.5rem;
  line-height: 1;
  position: relative;
  z-index: 1;
}

.scoreSub {
  font-family: var(--f-mono);
  font-size: 0.7rem;
  color: var(--c-sepia);
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.stamp {
  font-size: 1.05rem !important;
}

.nextInfo {
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.78rem;
  color: var(--c-sepia);
}

.continueBtn {
  font-family: var(--f-display) !important;
  font-size: 1.05rem !important;
  padding: 0.85rem 2rem !important;
}
</style>
