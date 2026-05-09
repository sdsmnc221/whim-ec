import { ref, computed } from "vue";
import type { ConceptEntry } from "../types/concept";
import { THEMES } from "../utils/constants";

type Source = "bundled" | "file";

export function useConcepts() {
  const THEMES_SUB = THEMES.slice(1);

  const source = ref<Source | null>(null);
  const concepts = ref<ConceptEntry[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedThemes = ref<string[]>([...THEMES_SUB]);

  const filteredConcepts = computed(() => {
    if (selectedThemes.value.length === 0) return [];
    return concepts.value.filter((c) =>
      c.themes.some((t) => selectedThemes.value.includes(t)),
    );
  });

  async function loadBundled() {
    loading.value = true;
    error.value = null;
    try {
      const data = await import("../assets/data/concepts_sample.json");
      concepts.value = data.default as ConceptEntry[];
      source.value = "bundled";
    } catch {
      error.value = "Impossible de charger l'échantillon intégré.";
    } finally {
      loading.value = false;
    }
  }

  async function loadFile(file: File) {
    loading.value = true;
    error.value = null;
    try {
      concepts.value = JSON.parse(await file.text()) as ConceptEntry[];
      source.value = "file";
    } catch {
      error.value = "Fichier invalide — JSON malformé ou structure incorrecte.";
    } finally {
      loading.value = false;
    }
  }

  return {
    source,
    concepts,
    loading,
    error,
    selectedThemes,
    filteredConcepts,
    loadBundled,
    loadFile,
  };
}
