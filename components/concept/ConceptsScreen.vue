<template>
  <div :class="$style.header">
    <button :class="$style.retour" @click="navigateTo('/')">← retour</button>
    <span :class="$style.title">
      concepts républicains
      <span v-if="source"
        >·
        {{
          showBookmarks
            ? bookmarkedConcepts.length
            : showSeen
              ? seenConcepts.length
              : filteredConcepts.length
        }}</span
      >
    </span>
  </div>

  <div v-if="!source" :class="$style.pickerScreen">
    <div :class="$style.pickerHeading">fiches de révision</div>
    <WhimcPatch>
      <div :class="$style.patchHeading">source</div>
      <div :class="$style.sourceOptions">
        <button @click="handleLoadBundled">échantillon intégré</button>
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

  <div v-else :class="$style.screen">
    <div :class="$style.filterWrap">
      <div :class="$style.filterHeading">filtrer par</div>
      <button
        v-if="source"
        :class="[
          $style.filterToggle,
          showBookmarks && $style.filterToggleActive,
        ]"
        @click="
          showBookmarks = !showBookmarks;
          if (showBookmarks) showSeen = false;
        "
      >
        ◆ {{ bookmarkedIds.length }}
      </button>
      <button
        v-if="source"
        :class="[$style.filterToggle, showSeen && $style.filterToggleActive]"
        @click="
          showSeen = !showSeen;
          if (showSeen) showBookmarks = false;
        "
      >
        vu · {{ seenIds.length }}
      </button>
    </div>
    <ThemesFilter
      v-if="!showBookmarks && !showSeen"
      v-model="selectedThemes"
      :themes="THEMES_SUB"
      variant="chips"
    />

    <template v-if="showBookmarks">
      <p v-if="bookmarkedConcepts.length === 0" :class="$style.empty">
        Aucun favori pour l'instant
      </p>
      <div v-else :class="$style.grid">
        <ConceptCard
          v-for="c in bookmarkedConcepts"
          :key="c.id"
          :concept="c"
          :progress="getProgress(c.id)"
          @open="activeConceptId = c.id"
        />
      </div>
    </template>

    <template v-else-if="showSeen">
      <p v-if="seenConcepts.length === 0" :class="$style.empty">
        Aucune fiche vue pour l’instant
      </p>
      <div v-else :class="$style.grid">
        <ConceptCard
          v-for="c in seenConcepts"
          :key="c.id"
          :concept="c"
          :progress="getProgress(c.id)"
          @open="activeConceptId = c.id"
        />
      </div>
    </template>
    <template v-else>
      <p v-if="selectedThemes.length === 0" :class="$style.empty">
        Choisissez un thème pour explorer les fiches
      </p>
      <p v-else-if="filteredConcepts.length === 0" :class="$style.empty">
        Aucune fiche pour ces thèmes
      </p>
      <div v-else :class="$style.grid">
        <ConceptCard
          v-for="c in filteredConcepts"
          :key="c.id"
          :concept="c"
          :progress="getProgress(c.id)"
          @open="activeConceptId = c.id"
        />
      </div>
    </template>
  </div>

  <ConceptPanel
    :concept="activeConcept"
    :progress="activeProgress"
    @close="activeConceptId = null"
    @bookmark="activeConcept && toggleBookmark(activeConcept.id)"
    @seen="markSeen"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { THEMES } from "../../utils/constants";
import { useConcepts } from "../../composables/useConcepts";
import { useConceptProgress } from "../../composables/useConceptProgress";
import ConceptCard from "./ConceptCard.vue";
import ConceptPanel from "./ConceptPanel.vue";
import ThemesFilter from "../ui/ThemesFilter.vue";
import WhimcPatch from "../ui/WhimcPatch.vue";

const THEMES_SUB = THEMES.slice(1);
const LS_SOURCE_KEY = "whimec-concepts-source";

const {
  source,
  concepts,
  filteredConcepts,
  selectedThemes,
  error,
  loadBundled,
  loadFile,
  loadFromSessionStorage,
} = useConcepts();
const {
  getProgress,
  markSeen,
  toggleBookmark,
  pullFromConvex,
  bookmarkedIds,
  seenIds,
} = useConceptProgress();

const showBookmarks = ref(false);
const showSeen = ref(false);
watch(source, () => {
  showBookmarks.value = false;
  showSeen.value = false;
});

onMounted(async () => {
  const route = useRoute();
  const conceptSlug = route.query.concept as string | undefined;
  const savedSource = import.meta.client
    ? (localStorage.getItem(LS_SOURCE_KEY) as "bundled" | "file" | null)
    : null;

  let loaded = false;

  if (savedSource === "bundled") {
    await loadBundled();
    loaded = true;
  } else if (savedSource === "file") {
    loaded = await loadFromSessionStorage();
    // file gone from sessionStorage but we have a direct concept backlink → fall back to bundled
    if (!loaded && conceptSlug) {
      await loadBundled();
      loaded = true;
    }
  }

  if (loaded && conceptSlug) {
    const concept = concepts.value.find((c) => c.slug === conceptSlug);
    if (concept) {
      // ensure at least one of the concept's themes is selected so it appears in filteredConcepts
      const needed = concept.themes.filter(
        (t) => THEMES_SUB.includes(t) && !selectedThemes.value.includes(t),
      );
      if (needed.length)
        selectedThemes.value = [...selectedThemes.value, ...needed];
      await nextTick();
      activeConceptId.value = concept.id;
    }
  }

  pullFromConvex();
});

const activeConceptId = ref<string | null>(null);
const activeConcept = computed(() =>
  activeConceptId.value
    ? (concepts.value.find((c) => c.id === activeConceptId.value) ?? null)
    : null,
);
const bookmarkedConcepts = computed(() =>
  concepts.value.filter((c) => bookmarkedIds.value.includes(c.id)),
);
const seenConcepts = computed(() =>
  concepts.value.filter((c) => seenIds.value.includes(c.id)),
);
const activeProgress = computed(() =>
  activeConcept.value
    ? getProgress(activeConcept.value.id)
    : { conceptId: "", seen: 0, bookmarked: false },
);

async function handleLoadBundled() {
  if (import.meta.client) localStorage.setItem(LS_SOURCE_KEY, "bundled");
  await loadBundled();
}

function onFile(e: Event) {
  if (import.meta.client) localStorage.setItem(LS_SOURCE_KEY, "file");
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

.filterWrap {
  padding: 0.75rem 0;
  margin-bottom: 0.75rem;
  border-bottom: 1px dashed var(--c-linenD);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filterHeading {
  font-size: 0.5rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--c-sepia);
  margin-right: auto;
}

.filterToggle {
  background: none;
  border: 1px dashed var(--c-linenD);
  color: var(--c-sepia);
  font-family: var(--f-mono);
  font-size: 0.65rem;
  padding: 0.25rem 0.55rem;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    border-color 80ms,
    color 80ms,
    background 80ms;

  &:hover {
    border-color: var(--c-encre);
    color: var(--c-encre);
  }
}

.filterToggleActive {
  border-color: var(--c-encre);
  color: var(--c-encre);
  background: color-mix(in srgb, var(--c-encre) 6%, transparent);
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
