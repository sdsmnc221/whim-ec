<template>
  <div :class="$style.examScreen">Exam Screen</div>
</template>

<script setup lang="ts">
console.log("Selected theme set index:", history.state.theme);
</script>

<style module lang="scss">
.examScreen {
}
</style>
