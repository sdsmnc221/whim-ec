<template>
  <div :class="$style.wrap">
    <button
      v-for="i in total"
      :key="i - 1"
      :class="[
        $style.dot,
        answers[i - 1] !== null &&
          answers[i - 1] !== undefined &&
          $style.answered,
        flags[i - 1] === 'low-confidence' && $style.flagged,
        current === i - 1 && $style.current,
      ]"
      @click="$emit('go', i - 1)"
    >
      {{ i }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  total: number;
  answers: (number | null)[];
  flags: (string | null)[];
  current: number;
}>();

defineEmits<{ go: [index: number] }>();
</script>

<style lang="scss" module>
.wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin: 0.4rem 0 1.2rem;
  justify-content: center;
}

.dot {
  width: 26px;
  height: 26px;
  background: var(--c-linenD);
  border: 1px dashed var(--c-linenD);
  font-family: var(--f-mono);
  font-size: 0.58rem;
  color: var(--c-encre);
  cursor: pointer;

  &.answered {
    background: var(--c-bleu-pale);
    border-color: var(--c-bleu);
  }

  &.flagged {
    background: #fef3e2;
    border-color: var(--c-orange);
    color: var(--c-orange);
  }

  &.current {
    color: var(--c-bleu);
    outline: 2px solid var(--c-bleu);
  }
}
</style>
