<template>
  <div :class="$style.screen">
    <!-- sticky header -->
    <div :class="$style.header">
      <button :class="$style.retour" @click="navigateTo('/')">← retour</button>
      <span :class="$style.title"
        >timeline civique
        <span v-if="filteredEntries.length"
          >· {{ filteredEntries.length }}</span
        ></span
      >
    </div>

    <ThemesFilter
      v-model="selectedThemes"
      :themes="THEMES_SUB"
      :count="filteredEntries.length"
      count-label="entrée"
    />

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
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { THEMES } from "../../utils/constants";
import type { TimelineEntry } from "../../types/timeline";
import rawData from "../../assets/data/timeline_dataset.json";
import TimelineItem from "./TimelineItem.vue";
import TimelinePanel from "./TimelinePanel.vue";
import ThemesFilter from "../ui/ThemesFilter.vue";

const data = rawData as TimelineEntry[];
const THEMES_SUB = THEMES.slice(1);

const selectedThemes = ref<string[]>([...THEMES_SUB]);
const selectedEntry = ref<TimelineEntry | null>(null);

const filteredEntries = computed(() => {
  if (selectedThemes.value.length === 0) return [];
  return data.filter((e) => selectedThemes.value.includes(e.theme));
});

onMounted(async () => {
  const route = useRoute();
  const yearParam = route.query.year ? Number(route.query.year) : null;

  if (yearParam !== null) {
    const matchingThemes = [
      ...new Set(data.filter((e) => e.year === yearParam).map((e) => e.theme)),
    ];
    selectedThemes.value = matchingThemes;
    await nextTick();
    const el = document.querySelector(`[data-year="${yearParam}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.classList.add("highlight-entry");
    setTimeout(() => el?.classList.remove("highlight-entry"), 2000);
  }
});
</script>

<style lang="scss" module>
@use "../../styles/tokens" as *;

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
