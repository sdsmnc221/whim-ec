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
    :total-blocks="totalBlocks"
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
import { drawQuestions, drawMarathonQuestions } from "../../composables/useExamEngine";
import { useStats } from "../../composables/useStats";
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
const totalBlocks = ref(1);
const result = ref<{
  answers: (number | null)[];
  flags: (string | null)[];
  timeUsed: number;
  timesMs: number[];
  blockScores: { correct: number; total: number }[];
} | null>(null);
const loadError = ref("");

onMounted(async () => {
  sessionStorage.removeItem("examReady");

  const themesRaw = sessionStorage.getItem("examThemes");
  sessionStorage.removeItem("examThemes");
  const themes: string[] = themesRaw ? JSON.parse(themesRaw) : [];

  const examMode = sessionStorage.getItem("examMode") ?? "super-hard";
  const marathonSize = parseInt(sessionStorage.getItem("marathonSize") ?? "0");
  sessionStorage.removeItem("examMode");
  sessionStorage.removeItem("marathonSize");

  const seed = Date.now() % 999983;

  try {
    const dataset = await loadDataset();
    if (examMode === "marathon" && marathonSize >= 80) {
      questions.value = drawMarathonQuestions(dataset, themes, seed, marathonSize);
      totalBlocks.value = marathonSize / 40;
    } else {
      questions.value = drawQuestions(dataset, themes, seed);
      totalBlocks.value = 1;
    }
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

const { recordSession } = useStats();
function handleFinalise(res: {
  answers: (number | null)[];
  flags: (string | null)[];
  timeUsed: number;
  timesMs: number[];
  blockScores: { correct: number; total: number }[];
}) {
  result.value = res;
  screen.value = "results";
  recordSession(questions.value, res.answers, res.timesMs);
}

function handleRestart() {
  navigateTo("/");
}
</script>
