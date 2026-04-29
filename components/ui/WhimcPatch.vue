<template>
  <div :class="$style.container" :style="inheritStyle">
    <WhimcCorner />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";

import WhimcCorner from "./WhimcCorners.vue";

withDefaults(
  defineProps<{
    accent?: string;
  }>(),
  {
    accent: "var(--c-sepia)",
  },
);

const attrs = useAttrs();

const inheritStyle = computed(() => ({
  ...(typeof attrs.style === "object" && attrs.style ? attrs.style : {}),
}));
</script>

<style lang="scss" module>
.container {
  background-color: var(--c-craie);
  border: 1px dashed v-bind(accent);
  padding: 1rem;
  position: relative;
}
</style>
