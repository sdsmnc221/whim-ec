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
    </section>
  </div>
</template>

<script setup lang="ts">
import CrossStitch from "../ui/CrossStitch.vue";
import WhimcPatch from "../ui/WhimcPatch.vue";

const RULES = [
  ["40 questions", "28 conn. + 12 mises en situation"],
  ["45 minutes", "durée maximale"],
  ["32 / 40 (80 %)", "seuil de réussite"],
  ["Réponses masquées", "aucune correction pendant l'examen"],
  ["[Tab] Faible confiance", "orange · à réviser avant soumission"],
  ["[S] Soumettre", "boucle : faible confiance + sans réponse"],
];
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

.rulesHeading {
  font-family: var(--f-mono);
  font-size: 0.55rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--c-sepia);
  margin-bottom: 0.75rem;
}

.rule {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px dashed var(--linenD);
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
</style>
