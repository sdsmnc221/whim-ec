<template>
  <span :class="$style.corner" style="top: -7px; left: -3px">×</span>
  <span :class="$style.corner" style="top: -7px; right: -3px">×</span>
  <span :class="$style.corner" style="bottom: -9px; left: -3px">×</span>
  <span :class="$style.corner" style="bottom: -9px; right: -3px">×</span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: string;
  }>(),
  {
    color: "var(--c-sepia)",
  },
);
</script>

<style lang="scss" module>
.corner {
  position: absolute;
  font-family: var(--f-body);
  font-size: 0.8rem;
  line-height: 1;
  user-select: none;
  font-style: normal;
  color: v-bind(color);
}
</style>
