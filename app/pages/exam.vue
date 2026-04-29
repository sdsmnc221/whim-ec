<template>
  <ExamScreen />
</template>

<script setup lang="ts">
import ExamScreen from "../../components/exam/ExamScreen.vue";

definePageMeta({
  middleware: [
    () => {
      if (!import.meta.client) return; // skip SSR
      if (!sessionStorage.getItem("examReady")) {
        return navigateTo("/");
      }
    },
  ],
});

onMounted(() => {
  sessionStorage.removeItem("examReady");
});
</script>
