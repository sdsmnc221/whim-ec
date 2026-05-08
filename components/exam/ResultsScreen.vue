<template>
  <div :class="$style.screen">
    <CrossStitch
      :color="score.passed ? 'var(--c-vert)' : 'var(--c-rouge)'"
      :count="16"
      :seed="55"
    />

    <div :class="$style.container">
      <!-- score hero -->
      <div :class="$style.heroWrap">
        <WhimcCorners :accent="heroAccent" />
        <div :class="$style.hero" :style="{ borderColor: heroAccent }">
          <CrossStitch :color="heroAccent" :count="8" :seed="77" />
          <div :class="$style.heroLabel">
            résultats · {{ isMarathon ? "marathon" : "super-hard" }}
          </div>
          <div :class="$style.heroScore" :style="{ color: heroAccent }">
            {{ isMarathon ? score40 : score.correct }}
          </div>
          <div :class="$style.heroSub">
            <template v-if="isMarathon">
              {{ score.correct }}/{{ score.total }} brut · normalisé /40 · seuil 32/40
            </template>
            <template v-else>
              sur {{ score.total }} · {{ Math.round(score.pct * 100) }} %
              <template v-if="score.hasVerdict"> · seuil 32/40</template>
            </template>
          </div>
          <WhimcStamp
            v-if="score.hasVerdict"
            :color="score.passed ? 'var(--c-vert)' : 'var(--c-rouge)'"
            :angle="score.passed ? -1.5 : 2"
            :class="$style.verdictStamp"
          >
            {{ score.passed ? "× réussi" : "× à repasser" }}
          </WhimcStamp>
          <WhimcStamp v-else color="var(--c-sepia)" :angle="-1" :class="$style.verdictStamp">
            × session d'entraînement
          </WhimcStamp>
          <div :class="$style.heroNote">
            <template v-if="!score.hasVerdict">
              Session filtrée ({{ score.total }} questions). Le verdict requiert 15 questions minimum — choisissez "Tous les thèmes" pour simuler l'examen complet.
            </template>
            <template v-else-if="score.passed">
              Félicitations&nbsp;! Vous maîtrisez les connaissances civiques.
            </template>
            <template v-else>
              Il vous manquait {{ needed }} bonne{{ needed > 1 ? "s" : "" }} réponse{{ needed > 1 ? "s" : "" }}.
            </template>
          </div>
        </div>
      </div>

      <!-- 3-col stats -->
      <div :class="$style.statsGrid">
        <div v-for="s in statCards" :key="s.label" :class="$style.statWrap">
          <WhimcCorners :accent="s.color" />
          <div :class="$style.statCard" :style="{ borderColor: s.color }">
            <div :class="$style.statValue" :style="{ color: s.color }">{{ s.value }}</div>
            <div :class="$style.statLabel">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <!-- per-block breakdown (marathon only) -->
      <WhimcPatch v-if="isMarathon && result.blockScores && result.blockScores.length">
        <div :class="$style.sectionLabel">par bloc</div>
        <div
          v-for="(bs, i) in result.blockScores"
          :key="i"
          :class="$style.themeRow"
        >
          <div :class="$style.themeRowMeta">
            <span :class="$style.themeShort">Bloc {{ i + 1 }}</span>
            <span
              :class="$style.themeScore"
              :style="{
                color:
                  bs.correct >= 32 ? 'var(--c-vert)' : 'var(--c-rouge)',
              }"
            >
              {{ bs.correct }}/{{ bs.total }}
            </span>
          </div>
          <div :class="$style.themeTrack">
            <div
              :class="$style.themeFill"
              :style="{
                width: `${(bs.correct / bs.total) * 100}%`,
                background:
                  bs.correct / bs.total >= PASS_THRESHOLD
                    ? 'var(--c-vert)'
                    : 'var(--c-rouge)',
              }"
            />
          </div>
        </div>
      </WhimcPatch>

      <!-- by theme -->
      <WhimcPatch>
        <div :class="$style.sectionLabel">par thème</div>
        <div v-for="t in byTheme" :key="t.short" :class="$style.themeRow">
          <div :class="$style.themeRowMeta">
            <span :class="$style.themeShort">{{ t.short }}</span>
            <span :class="$style.themeScore" :style="{ color: t.pct >= PASS_THRESHOLD ? 'var(--c-vert)' : 'var(--c-orange)' }">
              {{ t.correct }}/{{ t.total }}
            </span>
          </div>
          <div :class="$style.themeTrack">
            <div
              :class="$style.themeFill"
              :style="{
                width: `${t.pct * 100}%`,
                background: t.pct >= PASS_THRESHOLD ? 'var(--c-vert)' : 'var(--c-orange)',
              }"
            />
          </div>
        </div>
      </WhimcPatch>

      <!-- wrong questions -->
      <template v-if="wrong.length > 0">
        <button
          :class="$style.toggleBtn"
          style="border-color: var(--c-rouge); color: var(--c-rouge)"
          @click="showWrong = !showWrong"
        >
          {{ showWrong ? "× masquer" : "→ voir les erreurs d'abord" }} ({{ wrong.length }})
        </button>
        <div v-if="showWrong" :class="$style.cardList">
          <QuestionCard
            v-for="{ q, i } in wrong"
            :key="q.id"
            :q="q"
            :idx="i"
            :total="questions.length"
            :answer="answers[i]"
            :flag="null"
            :revealed="true"
            phase="results"
            @answer="() => {}"
            @flag="() => {}"
          />
        </div>
      </template>

      <!-- low confidence -->
      <WhimcPatch v-if="lowConf.length > 0 && !showWrong" accent="var(--c-orange)">
        <div :class="$style.sectionLabel" style="color: var(--c-orange)">
          confiance faible ({{ lowConf.length }})
        </div>
        <div :class="$style.cardList">
          <QuestionCard
            v-for="{ q, i } in lowConf"
            :key="q.id"
            :q="q"
            :idx="i"
            :total="questions.length"
            :answer="answers[i]"
            :flag="null"
            :revealed="true"
            phase="results"
            @answer="() => {}"
            @flag="() => {}"
          />
        </div>
      </WhimcPatch>

      <!-- full correction -->
      <button :class="$style.toggleBtn" @click="showAll = !showAll">
        {{ showAll ? "× masquer la correction complète" : "→ correction complète" }}
      </button>
      <div v-if="showAll" :class="$style.cardList">
        <QuestionCard
          v-for="(q, i) in questions"
          :key="q.id"
          :q="q"
          :idx="i"
          :total="questions.length"
          :answer="answers[i]"
          :flag="null"
          :revealed="true"
          phase="results"
          @answer="() => {}"
          @flag="() => {}"
        />
      </div>

      <WhimcBtn variant="primary" :class="$style.restartBtn" @click="$emit('restart')">
        ↺ Recommencer
      </WhimcBtn>

      <footer :class="$style.footer">× liberté × égalité × fraternité ×</footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { BuiltQuestion } from "../../composables/useExamEngine";
import { computeScore, fmtTime, PASS_THRESHOLD } from "../../composables/useExamEngine";
import { THEMES, THEME_SHORT } from "../../utils/constants";
import CrossStitch from "../ui/CrossStitch.vue";
import WhimcCorners from "../ui/WhimcCorners.vue";
import WhimcStamp from "../ui/WhimcStamp.vue";
import WhimcPatch from "../ui/WhimcPatch.vue";
import WhimcBtn from "../ui/WhimcBtn.vue";
import QuestionCard from "./QuestionCard.vue";

const props = defineProps<{
  questions: BuiltQuestion[];
  result: {
    answers: (number | null)[];
    flags: (string | null)[];
    timeUsed: number;
    blockScores?: { correct: number; total: number }[];
  };
}>();

defineEmits<{ restart: [] }>();

const showAll = ref(false);
const showWrong = ref(false);

const { answers, flags, timeUsed } = props.result;

const isMarathon = computed(
  () => (props.result.blockScores?.length ?? 0) > 0,
);
const score = computed(() => computeScore(props.questions, answers));
const score40 = computed(() =>
  Math.round((score.value.correct / score.value.total) * 40),
);

const needed = computed(() =>
  Math.ceil(props.questions.length * PASS_THRESHOLD) - score.value.correct,
);

const heroAccent = computed(() => {
  if (!score.value.hasVerdict) return "var(--c-sepia)";
  return score.value.passed ? "var(--c-vert)" : "var(--c-rouge)";
});

const wrong = computed(() =>
  props.questions
    .map((q, i) => ({ q, i }))
    .filter(({ q, i }) => answers[i] !== q.correctDisplayIndex),
);

const lowConf = computed(() =>
  props.questions
    .map((q, i) => ({ q, i }))
    .filter(({ i }) => flags[i] === "low-confidence"),
);

const byTheme = computed(() =>
  THEMES.slice(1)
    .map((th) => {
      const qs = props.questions.map((q, i) => ({ q, i })).filter(({ q }) => q.theme === th);
      if (!qs.length) return null;
      const correct = qs.filter(({ q, i }) => answers[i] === q.correctDisplayIndex).length;
      return { short: THEME_SHORT[th], correct, total: qs.length, pct: correct / qs.length };
    })
    .filter(Boolean) as { short: string; correct: number; total: number; pct: number }[],
);

const statCards = computed(() => [
  { label: "temps", value: fmtTime(timeUsed), color: "var(--c-bleu)" },
  {
    label: "score",
    value: `${Math.round(score.value.pct * 100)}%`,
    color: score.value.passed ? "var(--c-vert)" : "var(--c-rouge)",
  },
  {
    label: "erreurs",
    value: String(wrong.value.length),
    color: wrong.value.length === 0 ? "var(--c-vert)" : "var(--c-rouge)",
  },
]);
</script>

<style lang="scss" module>
@use "../../styles/tokens" as *;

.screen {
  position: relative;
  min-height: 100vh;
  padding: 2rem 1.25rem 4rem;
  font-family: var(--f-mono);
  color: var(--c-encre);

  @include linen-bg;
}

.container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.heroWrap {
  position: relative;
}

.hero {
  background-color: var(--c-craie);
  border: 1px dashed var(--c-sepia);
  padding: 1.5rem 1rem;
  text-align: center;
  overflow: hidden;
  position: relative;
}

.heroLabel {
  font-family: var(--f-mono);
  font-size: 0.55rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-sepia);
  margin-bottom: 0.4rem;
}

.heroScore {
  font-family: var(--f-display);
  font-size: 4.5rem;
  line-height: 1;
  position: relative;
  z-index: 1;
}

.heroSub {
  font-family: var(--f-mono);
  font-size: 0.7rem;
  color: var(--c-sepia);
  margin-bottom: 1rem;
}

.verdictStamp {
  font-size: 1.05rem !important;
}

.heroNote {
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.78rem;
  color: var(--c-sepia);
  margin-top: 0.75rem;
  line-height: 1.5;
}

.statsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
}

.statWrap {
  position: relative;
}

.statCard {
  background-color: var(--c-craie);
  border: 1px dashed var(--c-sepia);
  padding: 0.6rem;
  text-align: center;
}

.statValue {
  font-family: var(--f-display);
  font-size: 1.4rem;
}

.statLabel {
  font-family: var(--f-mono);
  font-size: 0.53rem;
  color: var(--c-sepia);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 0.2rem;
}

.sectionLabel {
  font-family: var(--f-mono);
  font-size: 0.55rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--c-sepia);
  margin-bottom: 0.75rem;
}

.themeRow {
  margin-bottom: 0.65rem;
}

.themeRowMeta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.2rem;
}

.themeShort {
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.75rem;
}

.themeScore {
  font-family: var(--f-mono);
  font-size: 0.65rem;
}

.themeTrack {
  height: 3px;
  background: var(--c-linenD);
}

.themeFill {
  height: 100%;
  transition: width 600ms;
}

.toggleBtn {
  width: 100%;
  background: none;
  border: 1px dashed var(--c-sepia);
  color: var(--c-sepia);
  font-family: var(--f-mono);
  font-size: 0.72rem;
  padding: 0.5rem 0.85rem;
  cursor: pointer;
}

.cardList {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.restartBtn {
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
}
</style>
