<template>
  <div :class="$style.examScreen">Exam Screen</div>
</template>

<script setup lang="ts">
const { query } = useRoute();
console.log("Selected theme set index:", query.theme);
</script>

<style module lang="scss">
.examScreen {
}
</style>
