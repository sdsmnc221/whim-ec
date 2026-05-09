<template>
  <button
    :class="[
      'whimc-btn',
      variant === 'primary' && 'primary',
      variant === 'danger' && 'danger',
      variant === 'outline' && 'outline',
      variant === 'orange' && 'orange',
      $attrs.class,
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: "primary" | "danger" | "outline" | "orange";
  disabled?: boolean;
}>();

defineOptions({
  inheritAttrs: true,
});
</script>

<style scoped lang="scss">
.whimc-btn {
  font-family: var(--f-mono);
  font-size: 0.72rem;
  padding: 0.5rem 0.85rem;
  cursor: pointer;
  border-width: 1px;
  border-style: dashed;
  &.primary {
    background: var(--c-bleu);
    border-color: var(--c-bleu-pale);
    color: var(--c-craie);
  }
  &.danger {
    background: var(--c-rouge);
    border-color: #fdecea;
    color: var(--c-craie);
  }
  &.outline {
    background: var(--c-craie);
    border-color: var(--c-bleu);
    color: var(--c-bleu);
  }
  &.orange {
    background: none;
    border-color: var(--c-orange);
    color: var(--c-orange);
  }
  &:disabled {
    cursor: default;
    opacity: 0.35;
  }
}
</style>
