<template>
  <div :class="$style.header">
    <button :class="$style.retour" @click="navigateTo('/')">← retour</button>
    <span :class="$style.title"
      >concepts républicains
      <span v-if="source">· {{ filteredConcepts.length }}</span></span
    >
  </div>

  <!-- Source picker — shown until a source is loaded -->
  <div v-if="!source" :class="$style.pickerScreen">
    <div :class="$style.pickerHeading">fiches de révision</div>
    <WhimcPatch>
      <div :class="$style.patchHeading">source</div>
      <div :class="$style.sourceOptions">
        <button @click="loadBundled">échantillon intégré</button>
        <label>
          importer un fichier JSON
          <input
            type="file"
            accept=".json"
            style="display: none"
            @change="onFile"
          />
        </label>
      </div>
      <p v-if="error">{{ error }}</p>
    </WhimcPatch>
  </div>

  <!-- Main screen -->
  <div v-else :class="$style.screen">
    <ThemesFilter
      v-model="selectedThemes"
      :themes="THEMES_SUB"
      variant="chips"
    />

    <!-- Empty state -->
    <p v-if="selectedThemes.length === 0" :class="$style.empty">
      Choisissez un thème pour explorer les fiches
    </p>
    <p v-else-if="filteredConcepts.length === 0" :class="$style.empty">
      Aucune fiche pour ces thèmes
    </p>

    <!-- Grid -->
    <div v-else :class="$style.grid">
      <ConceptCard
        v-for="c in filteredConcepts"
        :key="c.id"
        :concept="c"
        :progress="getProgress(c.id)"
        @open="activeConceptId = c.id"
      />
    </div>
  </div>

  <!-- Detail drawer — always mounted so v-if="concept" inside fires the enter transition -->
  <ConceptPanel
    :concept="activeConcept"
    :progress="activeProgress"
    @close="activeConceptId = null"
    @bookmark="activeConcept && toggleBookmark(activeConcept.id)"
    @seen="markSeen"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { THEMES } from "../../utils/constants";
import { useConcepts } from "../../composables/useConcepts";
import { useConceptProgress } from "../../composables/useConceptProgress";
import ConceptCard from "./ConceptCard.vue";
import ConceptPanel from "./ConceptPanel.vue";
import ThemesFilter from "../ui/ThemesFilter.vue";
import WhimcPatch from "../ui/WhimcPatch.vue";

const THEMES_SUB = THEMES.slice(1);
const {
  source,
  filteredConcepts,
  selectedThemes,
  error,
  loadBundled,
  loadFile,
} = useConcepts();
const { getProgress, markSeen, toggleBookmark, pullFromConvex } =
  useConceptProgress();

onMounted(() => pullFromConvex());

const activeConceptId = ref<string | null>(null);
const activeConcept = computed(() =>
  activeConceptId.value
    ? (filteredConcepts.value.find((c) => c.id === activeConceptId.value) ??
      null)
    : null,
);
const activeProgress = computed(() =>
  activeConcept.value
    ? getProgress(activeConcept.value.id)
    : { conceptId: "", seen: false, bookmarked: false },
);

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) loadFile(file);
}
</script>

<style lang="scss" module>
@use "../../styles/tokens" as *;

/* ── picker screen ─────────────────────────────────── */

.pickerScreen {
  min-height: 100vh;
  padding: 2rem 1.25rem 4rem;
  font-family: var(--f-mono);
  color: var(--c-encre);
  display: flex;
  flex-direction: column;
  gap: 1.75rem;

  @include linen-bg;
}

.pickerHeading {
  font-family: var(--f-display);
  font-size: 2rem;
  line-height: 1.1;
}

.patchHeading {
  font-family: var(--f-mono);
  font-size: 0.55rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--c-sepia);
  margin-bottom: 0.75rem;
}

.sourceOptions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  button,
  label {
    display: block;
    background: transparent;
    border: 1px dashed var(--c-linenD);
    color: var(--c-encre);
    font-family: var(--f-mono);
    font-size: 0.78rem;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    text-align: left;
    width: 100%;

    &:hover {
      border-color: var(--c-bleu);
      color: var(--c-bleu);
    }
  }
}

/* ── main screen ───────────────────────────────────── */

.screen {
  min-height: 100vh;
  padding: 0 1.25rem 5rem;
  font-family: var(--f-mono);
  color: var(--c-encre);

  @include linen-bg;
}

.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--c-linen);
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px dashed var(--c-linenD);
}

.retour {
  background: none;
  border: 1px dashed var(--c-sepia);
  color: var(--c-sepia);
  font-family: var(--f-mono);
  font-size: 0.65rem;
  padding: 0.35rem 0.65rem;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    border-color: var(--c-encre);
    color: var(--c-encre);
  }
}

.title {
  font-family: var(--f-mono);
  font-size: 0.55rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-sepia);
}

.empty {
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.85rem;
  color: var(--c-sepia);
  text-align: center;
  margin-top: 3rem;
}

.grid {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
</style>
