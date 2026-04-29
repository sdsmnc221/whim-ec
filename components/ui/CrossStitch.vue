<template>
  <div :class="$style.container">
    <span
      v-for="(item, i) in items"
      :key="i"
      class="material-symbols-outlined"
      :style="{
        left: item.left,
        top: item.top,
        transform: `rotate(${item.rot})`,
        opacity: item.op,
        fontSize: item.sz,
        color,
      }"
      >×</span
    >
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    color?: string;
    count?: number;
    seed?: number;
  }>(),
  {
    color: "var(--c-sepia)",
    count: 10,
    seed: 1,
  },
);

const items = Array.from({ length: props.count }, (_, i) => {
  const a = ((props.seed + i * 7919) % 100) / 100,
    b = ((props.seed + i * 6271) % 100) / 100;
  return {
    left: `${a * 86 + 2}%`,
    top: `${b * 78 + 5}%`,
    rot: `${(a * 50 - 25).toFixed(1)}deg`,
    op: (0.06 + a * 0.09).toFixed(2),
    sz: `${0.45 + b * 0.25}rem`,
  };
});
</script>

<style lang="scss" module>
.container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
</style>
