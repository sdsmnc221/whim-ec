<template>
  <div :class="$style.screen">
    <!-- sticky header -->
    <div :class="$style.header">
      <button :class="$style.retour" @click="navigateTo('/')">← retour</button>
      <span :class="$style.title">timeline civique</span>
    </div>

    <!-- theme filter -->
    <div :class="$style.filterWrap">
      <div :class="$style.filterHeading">filtrer par thème</div>
      <div :class="$style.themesContainer">
        <button
          :class="[
            $style.themeBtn,
            masterState === '×' && $style.themeBtnActive,
            masterState === '~' && $style.themeBtnPartial,
          ]"
          @click="toggleMaster"
        >
          {{ masterState ? masterState + " " : "" }}Tous les thèmes
        </button>
        <div :class="$style.subThemeGroup">
          <button
            v-for="theme in THEMES_SUB"
            :key="theme"
            :class="[
              $style.themeBtn,
              selectedThemes.includes(theme) && $style.themeBtnActive,
            ]"
            @click="toggleTheme(theme)"
          >
            {{ selectedThemes.includes(theme) ? "× " : "" }}{{ theme }}
          </button>
        </div>
      </div>
      <div :class="$style.count">
        {{ filteredEntries.length }} entrée{{ filteredEntries.length !== 1 ? "s" : "" }}
      </div>
    </div>

    <!-- timeline list -->
    <div :class="$style.list">
      <TimelineItem
        v-for="(entry, i) in filteredEntries"
        :key="`${entry.year}-${i}`"
        :entry="entry"
        @select="selectedEntry = entry"
      />
      <div v-if="selectedThemes.length === 0" :class="$style.empty">
        Choisissez un thème pour construire la timeline
      </div>
      <div v-else-if="filteredEntries.length === 0" :class="$style.empty">
        aucune entrée pour ces thèmes
      </div>
    </div>

    <!-- drill-down panel -->
    <TimelinePanel :entry="selectedEntry" @close="selectedEntry = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { THEMES } from "../utils/constants";
import type { TimelineEntry } from "../types/timeline";
import rawData from "../assets/data/timeline_dataset.json";
import TimelineItem from "./TimelineItem.vue";
import TimelinePanel from "./TimelinePanel.vue";

const data = rawData as TimelineEntry[];
const THEMES_SUB = THEMES.slice(1);

const selectedThemes = ref<string[]>([...THEMES_SUB]);
const selectedEntry = ref<TimelineEntry | null>(null);

const masterState = computed<"×" | "~" | "">(() => {
  if (selectedThemes.value.length === THEMES_SUB.length) return "×";
  if (selectedThemes.value.length === 0) return "";
  return "~";
});

function toggleMaster() {
  selectedThemes.value =
    selectedThemes.value.length === THEMES_SUB.length ? [] : [...THEMES_SUB];
}

function toggleTheme(theme: string) {
  selectedThemes.value = selectedThemes.value.includes(theme)
    ? selectedThemes.value.filter((t) => t !== theme)
    : [...selectedThemes.value, theme];
}

const filteredEntries = computed(() => {
  if (selectedThemes.value.length === 0) return [];
  return data.filter((e) => selectedThemes.value.includes(e.theme));
});
</script>

<style lang="scss" module>
@use "../styles/tokens" as *;

.screen {
  min-height: 100vh;
  padding-bottom: 3rem;
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

.filterWrap {
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px dashed var(--c-linenD);
}

.filterHeading {
  font-size: 0.5rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--c-sepia);
  margin-bottom: 0.6rem;
}

.themesContainer {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.themeBtn {
  background: transparent;
  border: 1px dashed var(--c-linenD);
  color: var(--c-encre);
  font-family: var(--f-sans);
  font-size: 0.75rem;
  text-align: left;
  padding: 0.32rem 0.6rem;
  cursor: pointer;
}

.themeBtnActive {
  background: var(--c-bleu-pale);
  border-color: var(--c-bleu);
  color: var(--c-bleu);
}

.themeBtnPartial {
  border-color: var(--c-sepia);
  color: var(--c-sepia);
}

.subThemeGroup {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-left: 0.85rem;
  border-left: 1px dashed var(--c-linenD);
}

.count {
  margin-top: 0.55rem;
  font-size: 0.55rem;
  color: var(--c-sepia);
  opacity: 0.7;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1rem 1.25rem;
}

.empty {
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.8rem;
  color: var(--c-sepia);
  text-align: center;
  padding: 2rem 0;
}
</style>
