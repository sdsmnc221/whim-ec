<template>
  <button
    :class="[
      $style.option,
      !revealed && selected && $style.selected,
      revealed && isCorrect && $style.correct,
      revealed && isChosen && !isCorrect && $style.wrong,
      revealed && !isCorrect && !isChosen && $style.dimmed,
    ]"
    :disabled="revealed"
    @click="$emit('pick')"
  >
    <span :class="$style.letter">[{{ letter }}]</span>
    {{ text }}
  </button>
</template>

<script setup lang="ts">
defineProps<{
  letter: string;
  text: string;
  selected: boolean;
  revealed: boolean;
  isCorrect: boolean;
  isChosen: boolean;
}>();

defineEmits<{ pick: [] }>();
</script>

<style lang="scss" module>
.option {
  background: var(--c-linen);
  border: 1px dashed var(--c-linenD);
  color: var(--c-encre);
  font-family: var(--f-sans);
  font-size: 0.8rem;
  text-align: left;
  padding: 0.5rem 0.7rem;
  cursor: pointer;
  width: 100%;
  transition: transform 80ms ease-out;

  &:disabled {
    cursor: default;
  }

  &.selected {
    background: var(--c-bleu-pale);
    border-color: var(--c-bleu);
    color: var(--c-bleu);
    transform: translate(1px, 1px);
  }

  &.correct {
    background: #e8f2ec;
    border-color: var(--c-vert);
    color: var(--c-vert);
  }

  &.wrong {
    background: #f8ebeb;
    border-color: var(--c-rouge);
    color: var(--c-rouge);
  }

  &.dimmed {
    background: var(--c-linen);
    border-color: var(--c-linenD);
    color: var(--c-sepia);
  }
}

.letter {
  font-family: var(--f-mono);
  font-size: 0.65rem;
  opacity: 0.4;
  margin-right: 0.5rem;
}
</style>
