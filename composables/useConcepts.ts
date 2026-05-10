import { ref, computed } from "vue";
import type { ConceptEntry } from "../types/concept";
import { THEMES } from "../utils/constants";

type Source = "bundled" | "file";

const SS_KEY = "whimec-concepts-content";

const VALID_THEMES = new Set(THEMES.slice(1));

// Single-word titles that are fragments, common nouns, or past participles —
const TITLE_BLOCKLIST = new Set([
  "Aujourd", // fragment of Aujourd'hui
  "États", // fragment of États-Unis
  "Gaulle", // fragment of de Gaulle
  "Notre", // fragment of Notre-Dame
  "Esprit", // fragment of L'Esprit des lois
  "Misérables", // fragment of Les Misérables
  "Seule", // adjective
  "Figure", // generic noun
  "Exposition", // generic noun
  "Article", // generic noun
  "Protection", // generic noun
  "Ouest", // directional noun
  "Publié", // past participle
  "Convention", // generic noun
]);

function isRelevantConcept(c: ConceptEntry): boolean {
  if (!c.themes.some((t) => VALID_THEMES.has(t))) return false;
  if (c.definition.trim().length < 30) return false;
  if (c.key_points.length === 0) return false;
  if (c.title.trim().length < 4) return false;
  if (TITLE_BLOCKLIST.has(c.title.trim())) return false;
  return true;
}

const THEME_ORDER = THEMES.slice(1);

export function useConcepts() {
  const THEMES_SUB = THEMES.slice(1);

  const source = ref<Source | null>(null);
  const concepts = ref<ConceptEntry[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedThemes = ref<string[]>([...THEMES_SUB]);

  const filteredConcepts = computed(() => {
    if (selectedThemes.value.length === 0) return [];
    return concepts.value
      .filter((c) => c.themes.some((t) => selectedThemes.value.includes(t)))
      .sort((a, b) => {
        const ta = THEME_ORDER.findIndex((t) => a.themes.includes(t));
        const tb = THEME_ORDER.findIndex((t) => b.themes.includes(t));
        if (ta !== tb) return ta - tb;
        return a.title.localeCompare(b.title, "fr");
      });
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
      concepts.value = [...merged.values()].filter(isRelevantConcept);
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
      concepts.value = (JSON.parse(text) as ConceptEntry[]).filter(
        isRelevantConcept,
      );
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
      concepts.value = (JSON.parse(raw) as ConceptEntry[]).filter(
        isRelevantConcept,
      );
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
