<template>
  <ResultsScreen
    v-if="screen === 'results' && result"
    :questions="questions"
    :result="result"
    @restart="handleRestart"
  />
  <ExamScreen
    v-else-if="screen === 'exam' && questions.length"
    :questions="questions"
    @finalise="handleFinalise"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { BuiltQuestion } from "../../composables/useExamEngine";
import { drawQuestions } from "../../composables/useExamEngine";
import { THEMES } from "../../utils/constants";
import ExamScreen from "../../components/exam/ExamScreen.vue";
import ResultsScreen from "../../components/exam/ResultsScreen.vue";

definePageMeta({
  middleware: [
    () => {
      if (!import.meta.client) return;
      if (!sessionStorage.getItem("examReady")) {
        return navigateTo("/");
      }
    },
  ],
});

const screen = ref<"exam" | "results">("exam");
const questions = ref<BuiltQuestion[]>([]);
const result = ref<{ answers: (number | null)[]; flags: (string | null)[]; timeUsed: number } | null>(null);

onMounted(async () => {
  sessionStorage.removeItem("examReady");

  const themeIndex: number = history.state.theme ?? 0;
  const theme = THEMES[themeIndex] ?? "Tous les thèmes";
  const seed = Date.now() % 999983;

  // load dataset at runtime so it's not bundled into the initial JS
  const dataset = await import("../../assets/data/unified_dataset_complete.json").then(
    (m) => m.default,
  );
  questions.value = drawQuestions(dataset, theme, seed);
});

function handleFinalise(res: { answers: (number | null)[]; flags: (string | null)[]; timeUsed: number }) {
  result.value = res;
  screen.value = "results";
}

function handleRestart() {
  navigateTo("/");
}
</script>
