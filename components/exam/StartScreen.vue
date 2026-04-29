<template>
  <div :class="$style.startScreen">
    <CrossStitch :count="18" :seed="3" />

    <section :class="$style.container">
      <div>
        <div :class="$style.subHeading">simulateur d'examen civique</div>

        <h1 :class="$style.heading">
          whim<span style="color: var(--c-rouge)">·</span>ec
        </h1>

        <div :class="$style.description">
          40 questions · 28 connaissances + 12 mises en situation · 45 min ·
          seuil 80 %
        </div>
      </div>

      <WhimcPatch accent="var(--c-bleu)">
        <div :class="$style.rulesHeading">règles — mode super-hard</div>
        <div
          v-for="([k, v], index) in RULES"
          :key="`rules-super-hard-${index}`"
          :class="$style.rule"
        >
          <span :class="$style.ruleSet1">{{ k }}</span>
          <span :class="$style.ruleSet2">{{ v }}</span>
        </div>
      </WhimcPatch>

      <WhimcPatch>
        <div :class="$style.themesHeading">filtrer par thème</div>
        <div :class="$style.themesContainer">
          <button
            v-for="(theme, index) in THEMES"
            :key="`ec-theme-${index}`"
            :class="[
              $style.themeSet,
              index === themeSetIndex ? $style.themeSetActive : '',
            ]"
            @click="handleThemeSetClick(index)"
          >
            {{ themeSetIndex === index ? "× " : "" }}
            {{ theme }}
          </button>
        </div>
      </WhimcPatch>

      <WhimcBtn
        variant="primary"
        :class="$style.btnStart"
        @click="$emit('start')"
        >commencer l'examen →</WhimcBtn
      >

      <footer :class="$style.footer">× liberté × égalité × fraternité ×</footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";

import CrossStitch from "../ui/CrossStitch.vue";
import WhimcPatch from "../ui/WhimcPatch.vue";
import WhimcBtn from "../ui/WhimcBtn.vue";

const THEMES = [
  "Tous les thèmes",
  "Principes et valeurs de la République",
  "Système institutionnel et politique",
  "Droits et devoirs",
  "Histoire, géographie et culture",
  "Vivre dans la société française",
];

const RULES = [
  ["40 questions", "28 conn. + 12 mises en situation"],
  ["45 minutes", "durée maximale"],
  ["32 / 40 (80 %)", "seuil de réussite"],
  ["Réponses masquées", "aucune correction pendant l'examen"],
  ["[Tab] Faible confiance", "orange · à réviser avant soumission"],
  ["[S] Soumettre", "boucle : faible confiance + sans réponse"],
];

const themeSetIndex: Ref<number> = ref(0);

const handleThemeSetClick = (index: number) => {
  themeSetIndex.value = index;
};
</script>

<style lang="scss" module>
@use "../../styles/tokens" as *;

.startScreen {
  min-height: 100vh;
  padding: 2rem 1.25rem 3rem;
  color: var(--c-encre);
  font-family: var(--f-mono);

  @include linen-bg;
}

.container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.subHeading {
  font-family: var(--f-mono);
  font-size: 0.55rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-sepia);
}

.heading {
  font-family: var(--f-display);
  font-size: 2.2rem;
  line-height: 1.1;
  margin: 0.25rem 0;
}

.description {
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.85rem;
  color: var(--c-sepia);
}

.rulesHeading,
.themesHeading {
  font-family: var(--f-mono);
  font-size: 0.55rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--c-sepia);
  margin-bottom: 0.75rem;
}

.themesHeading {
  margin-bottom: 0.65rem;
}

.rule {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px dashed var(--c-linenD);
  padding: 0.32rem 0;
}

.ruleSet1 {
  font-family: var(--f-display);
  font-size: 0.92rem;
  color: var(--c-bleu);
}

.ruleSet2 {
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.72rem;
  color: var(--c-sepia);
  text-align: right;
  max-width: 55%;
}

.themesContainer {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.themeSet {
  background: transparent;
  border: 1px dashed var(--c-linenD);
  color: var(--c-encre);
  font-family: var(--f-sans);
  font-size: 0.78rem;
  text-align: left;
  padding: 0.38rem 0.65rem;
  cursor: pointer;
}
.themeSetActive {
  background: var(--c-bleu-pale);
  border: 1px dashed var(--c-bleu);
  color: var(--c-bleu);
}

.btnStart {
  font-family: var(--f-display) !important;
  font-size: 1.05rem !important;
  padding: 0.85rem !important;
}

.footer {
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.7rem;
  color: var(--c-sepia);
  text-align: center;
  position: fixed;
  left: 50%;
  bottom: 2.4rem;
  transform: translateX(-50%);
}
</style>
