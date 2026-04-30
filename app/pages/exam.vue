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
  <div
    v-else-if="loadError"
    style="padding: 2rem; font-family: var(--f-mono); color: var(--c-rouge)"
  >
    {{ loadError }}
  </div>
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
const result = ref<{
  answers: (number | null)[];
  flags: (string | null)[];
  timeUsed: number;
} | null>(null);
const loadError = ref("");

onMounted(async () => {
  sessionStorage.removeItem("examReady");

  const themeIndex: number = history.state.theme ?? 0;
  const theme = THEMES[themeIndex] ?? "Tous les thèmes";
  const seed = Date.now() % 999983;

  try {
    const dataset = await loadDataset();
    questions.value = drawQuestions(dataset, theme, seed);
  } catch (e) {
    loadError.value =
      e instanceof Error ? e.message : "Erreur de chargement du dataset.";
  }
});

async function loadDataset() {
  const source = sessionStorage.getItem("datasetSource") ?? "bundled";

  if (source === "url") {
    const url = sessionStorage.getItem("datasetUrl");
    if (!url) throw new Error("URL manquante.");
    const res = await fetch(url);
    if (!res.ok)
      throw new Error(`Impossible de charger le dataset (${res.status}).`);
    return res.json();
  }

  if (source === "file") {
    const content = sessionStorage.getItem("whimec-dataset-content");
    if (!content) throw new Error("Contenu du fichier introuvable.");
    return JSON.parse(content);
  }

  return import("../../assets/data/dataset_sample.json").then((m) => m.default);
}

function handleFinalise(res: {
  answers: (number | null)[];
  flags: (string | null)[];
  timeUsed: number;
}) {
  result.value = res;
  screen.value = "results";
}

function handleRestart() {
  navigateTo("/");
}
</script>
