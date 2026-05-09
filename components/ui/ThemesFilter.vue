<template>
  <div :class="$style.filterWrap">
    <div :class="$style.filterHeading">filtrer par thème</div>

    <!-- list variant: vertical with master toggle (timeline-style) -->
    <template v-if="variant === 'list'">
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
            v-for="theme in themes"
            :key="theme"
            :class="[
              $style.themeBtn,
              modelValue.includes(theme) && $style.themeBtnActive,
            ]"
            @click="toggle(theme)"
          >
            {{ modelValue.includes(theme) ? "× " : "" }}{{ theme }}
          </button>
        </div>
      </div>
      <div v-if="count !== undefined" :class="$style.count">
        {{ count }} {{ countLabel }}{{ count !== 1 ? "s" : "" }}
      </div>
    </template>

    <!-- chips variant: horizontal colored chips (concepts-style) -->
    <template v-else>
      <div :class="$style.chips">
        <button
          v-for="theme in themes"
          :key="theme"
          :style="{ '--chip-c': THEME_COLOR[theme] }"
          :class="[
            $style.chip,
            modelValue.includes(theme) && $style.chipActive,
          ]"
          @click="toggle(theme)"
        >
          {{ THEME_SHORT[theme] ?? theme }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { THEME_SHORT, THEME_COLOR } from "../../utils/constants";

const props = defineProps<{
  modelValue: string[];
  themes: string[];
  variant?: "list" | "chips";
  count?: number;
  countLabel?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [themes: string[]];
}>();

// list variant helpers
const masterState = computed<"×" | "~" | "">(() => {
  if (props.modelValue.length === props.themes.length) return "×";
  if (props.modelValue.length === 0) return "";
  return "~";
});

function toggleMaster() {
  emit(
    "update:modelValue",
    props.modelValue.length === props.themes.length ? [] : [...props.themes],
  );
}

function toggle(theme: string) {
  emit(
    "update:modelValue",
    props.modelValue.includes(theme)
      ? props.modelValue.filter((t) => t !== theme)
      : [...props.modelValue, theme],
  );
}
</script>

<style lang="scss" module>
@use "../../styles/tokens" as *;

.filterWrap {
  padding: 1rem 0;
  margin-bottom: 0.75rem;
  border-bottom: 1px dashed var(--c-linenD);
}

.filterHeading {
  font-size: 0.5rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--c-sepia);
  margin-bottom: 0.6rem;
}

/* ── list variant ──────────────────────────────────── */

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

/* ── chips variant ─────────────────────────────────── */

.chips {
  display: flex;
  flex-wrap: wrap;

  gap: 0.35rem;
}

.chip {
  background: transparent;
  border: 1px dashed var(--c-linenD);
  color: var(--c-encre);
  font-family: var(--f-mono);
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  transition:
    border-color 80ms,
    color 80ms,
    background 80ms;

  &:hover {
    border-color: var(--chip-c);
    color: var(--chip-c);
  }
}

.chipActive {
  border-color: var(--chip-c);
  color: var(--chip-c);
  background: color-mix(in srgb, var(--chip-c) 8%, transparent);
}
</style>
