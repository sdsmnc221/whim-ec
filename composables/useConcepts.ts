import { ref, computed } from "vue";
import type { ConceptEntry } from "../types/concept";
import { THEMES } from "../utils/constants";

type Source = "bundled" | "file";

const SS_KEY = "whimec-concepts-content";

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
      const modules = import.meta.glob<{ default: ConceptEntry[] }>(
        "../assets/data/concepts_sample_*.json",
        { eager: true },
      );
      const sorted = Object.entries(modules).sort(([a], [b]) =>
        a.localeCompare(b),
      );
      const merged = new Map<string, ConceptEntry>();
      for (const [, mod] of sorted) {
        for (const concept of mod.default) {
          merged.set(concept.id, concept);
        }
      }
      if (merged.size === 0) throw new Error("no files matched");
      concepts.value = [...merged.values()];
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
      const text = await file.text();
      concepts.value = JSON.parse(text) as ConceptEntry[];
      source.value = "file";
      if (import.meta.client) sessionStorage.setItem(SS_KEY, text);
    } catch {
      error.value = "Fichier invalide — JSON malformé ou structure incorrecte.";
    } finally {
      loading.value = false;
    }
  }

  async function loadFromSessionStorage(): Promise<boolean> {
    if (!import.meta.client) return false;
    const raw = sessionStorage.getItem(SS_KEY);
    if (!raw) return false;
    try {
      concepts.value = JSON.parse(raw) as ConceptEntry[];
      source.value = "file";
      return true;
    } catch {
      return false;
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
    loadFromSessionStorage,
  };
}
