<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="concept"
        :class="$style.overlay"
        @click.self="$emit('close')"
      />
    </Transition>
    <Transition name="slide-up">
      <div v-if="concept" :class="$style.panel" role="dialog" aria-modal="true">
        <div :class="$style.handle" />

        <div :class="$style.header">
          <span :class="$style.title">{{ concept.title }}</span>
          <div :class="$style.actions">
            <button
              :class="[
                $style.iconBtn,
                progress.bookmarked && $style.iconBtnActive,
              ]"
              aria-label="Mettre en favori"
              @click="$emit('bookmark')"
            >
              ◆
            </button>
            <button :class="$style.closeBtn" @click="$emit('close')">×</button>
          </div>
        </div>

        <div :class="$style.body">
          <!-- Définition -->
          <section :class="$style.section">
            <h2 :class="$style.sectionTitle">Définition</h2>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p
              :class="$style.text"
              v-html="renderMarkdown(concept.definition)"
            />
          </section>

          <!-- À retenir -->
          <section v-if="concept.key_points.length" :class="$style.section">
            <h2 :class="$style.sectionTitle">À retenir</h2>
            <ul :class="$style.list">
              <li
                v-for="(pt, i) in concept.key_points"
                :key="i"
                :class="$style.listItem"
              >
                {{ pt }}
              </li>
            </ul>
          </section>

          <!-- Liens thématiques -->
          <section v-if="concept.thematic_links" :class="$style.section">
            <h2 :class="$style.sectionTitle">Liens thématiques</h2>
            <p :class="$style.text">{{ concept.thematic_links }}</p>
          </section>

          <!-- Événements liés -->
          <section v-if="concept.timeline_refs.length" :class="$style.section">
            <h2 :class="$style.sectionTitle">Événements liés</h2>
            <div :class="$style.chips">
              <NuxtLink
                v-for="(ref, i) in concept.timeline_refs"
                :key="i"
                :to="`/timeline?year=${ref.year}`"
                :class="$style.chip"
              >
                {{ ref.year }}{{ ref.year_end ? `–${ref.year_end}` : "" }}
              </NuxtLink>
            </div>
          </section>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from "vue";
import type { ConceptEntry, ConceptProgress } from "../../types/concept";

const props = defineProps<{
  concept: ConceptEntry | null;
  progress: ConceptProgress;
}>();

const emit = defineEmits<{
  close: [];
  bookmark: [];
  seen: [id: string];
}>();

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
}

function markSeen(id: string) {
  emit("seen", id);
}

watch(
  () => props.concept,
  (val) => {
    if (!import.meta.client) return;
    document.body.style.overflow = val ? "hidden" : "";
    if (val) markSeen(val.id);
  },
);
</script>

<style lang="scss" module>
@use "../../styles/tokens" as *;

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.4);
  z-index: 50;
}

.panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 75vh;
  overflow-y: auto;
  z-index: 51;
  background: var(--c-craie);
  border-top: 1px dashed var(--c-sepia);
  padding: 0 1.25rem 2.5rem;
}

.handle {
  width: 2.5rem;
  height: 3px;
  background: var(--c-linenD);
  border-radius: 2px;
  margin: 0.75rem auto 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.75rem 0 0.65rem;
  border-bottom: 1px dashed var(--c-linenD);
  margin-bottom: 1rem;
}

.title {
  font-family: var(--f-display);
  font-size: 1.4rem;
  color: var(--c-encre);
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.iconBtn {
  background: none;
  border: 1px dashed var(--c-sepia);
  color: var(--c-sepia);
  font-size: 0.7rem;
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: var(--c-encre);
    color: var(--c-encre);
  }

  &Active {
    border-color: var(--c-encre);
    color: var(--c-encre);
  }
}

.closeBtn {
  background: none;
  border: 1px dashed var(--c-sepia);
  color: var(--c-sepia);
  font-family: var(--f-mono);
  font-size: 1rem;
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    border-color: var(--c-rouge);
    color: var(--c-rouge);
  }
}

.body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sectionTitle {
  font-family: var(--f-mono);
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-sepia);
  margin: 0;
}

.text {
  font-family: var(--f-body);
  font-size: 0.92rem;
  line-height: 1.7;
  color: var(--c-encre);
  margin: 0;
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.listItem {
  font-family: var(--f-body);
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--c-encre);
  padding-left: 1rem;
  position: relative;

  &::before {
    content: "–";
    position: absolute;
    left: 0;
    color: var(--c-sepia);
  }
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.chip {
  font-family: var(--f-mono);
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: var(--c-sepia);
  border: 1px dashed var(--c-sepia);
  padding: 0.2rem 0.55rem;
  text-decoration: none;
  transition:
    border-color 80ms ease-out,
    color 80ms ease-out;

  &:hover {
    border-color: var(--c-encre);
    color: var(--c-encre);
  }
}
</style>
