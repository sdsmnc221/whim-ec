<template>
  <span :class="$style.stamp" :style="{ color: color, borderColor: color, transform: `rotate(${angle}deg)` }">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: string;
    angle?: number;
  }>(),
  {
    color: "var(--c-bleu)",
    angle: -1.5,
  },
);
</script>

<style lang="scss" module>
.stamp {
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.8rem;
  border: 1px dashed currentColor;
  padding: 0.05rem 0.45rem;
  display: inline-block;
  opacity: 0.9;
}
</style>
