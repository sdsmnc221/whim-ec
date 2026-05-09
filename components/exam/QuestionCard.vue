<template>
  <div :class="$style.wrap">
    <WhimcCorners :accent="isMise ? 'var(--c-orange)' : 'var(--c-bleu)'" />
    <div :class="[$style.inner, isMise && $style.mise]">
      <CrossStitch
        :color="isMise ? 'var(--c-orange)' : 'var(--c-bleu)'"
        :count="7"
        :seed="idx * 17 + 3"
      />

      <div :class="$style.meta">
        <div :class="$style.metaLeft">
          <span :class="$style.label">
            {{ THEME_SHORT[q.theme] ?? q.theme }} · Q.{{
              String(idx + 1).padStart(2, "0")
            }}/{{ total }}
          </span>
          <WhimcStamp
            v-if="isMise"
            color="var(--c-orange)"
            :angle="-1"
            :class="$style.miseStamp"
          >
            mise en situation
          </WhimcStamp>
        </div>

        <button
          :class="[
            $style.flagBtn,
            flag === 'low-confidence' && $style.flagActive,
          ]"
          @click="$emit('flag')"
        >
          <span :class="$style.flagGlyph">~</span>
          doute
        </button>
      </div>

      <div v-if="phase === 'review'" :class="$style.reviewBanner">
        {{
          answer === null || answer === undefined
            ? "⚠ sans réponse"
            : "~ confiance faible — révision"
        }}
      </div>

      <div :class="$style.question">{{ q.question }}</div>

      <div :class="$style.answers">
        <AnswerOption
          v-for="(ans, i) in q.displayAnswers"
          :key="i"
          :letter="String.fromCharCode(65 + i)"
          :text="ans"
          :selected="answer === i"
          :revealed="revealed"
          :is-correct="revealed && i === q.correctDisplayIndex"
          :is-chosen="revealed && i === answer"
          @pick="!revealed && $emit('answer', i)"
        />
      </div>

      <div v-if="revealed" :class="$style.explication">
        {{ q.explication }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { BuiltQuestion } from "../../composables/useExamEngine";
import { THEME_SHORT } from "../../utils/constants";
import WhimcCorners from "../ui/WhimcCorners.vue";
import WhimcStamp from "../ui/WhimcStamp.vue";
import CrossStitch from "../ui/CrossStitch.vue";
import AnswerOption from "./AnswerOption.vue";

const props = defineProps<{
  q: BuiltQuestion;
  idx: number;
  total: number;
  answer: number | null;
  flag: string | null;
  revealed: boolean;
  phase: "exam" | "review" | "results";
}>();

defineEmits<{ answer: [index: number]; flag: [] }>();

const isMise = computed(() => props.q.type === "mise-situation");
</script>

<style lang="scss" module>
@use "../../styles/tokens" as *;

.wrap {
  position: relative;
}

.inner {
  background-color: var(--c-craie);
  border: 1px dashed var(--c-sepia);
  padding: 1rem;
  overflow: hidden;

  &.mise {
    border-color: var(--c-orange);
  }
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.6rem;
  position: relative;
  z-index: 1;
}

.metaLeft {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.label {
  font-family: var(--f-mono);
  font-size: 0.55rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-sepia);
}

.miseStamp {
  font-size: 0.7rem !important;
}

.flagBtn {
  background: none;
  border: 1px dashed var(--c-linenD);
  color: var(--c-sepia);
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.78rem;
  padding: 0.35rem 0.6rem;
  cursor: pointer;
  min-height: 44px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 0.3rem;

  &.flagActive {
    background: #fef3e2;
    border-color: var(--c-orange);
    color: var(--c-orange);
  }
}

.flagGlyph {
  font-size: 0.9rem;
}

.reviewBanner {
  font-family: var(--f-mono);
  font-size: 0.6rem;
  color: var(--c-orange);
  border: 1px dashed var(--c-orange);
  padding: 0.2rem 0.5rem;
  margin-bottom: 0.6rem;
  display: inline-block;
  position: relative;
  z-index: 1;
}

.question {
  font-family: var(--f-body);
  font-size: 0.95rem;
  line-height: 1.65;
  margin-bottom: 0.9rem;
  position: relative;
  z-index: 1;
}

.answers {
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
  position: relative;
  z-index: 1;
}

.explication {
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.78rem;
  color: var(--c-sepia);
  margin-top: 0.75rem;
  line-height: 1.55;
  border-top: 1px dashed var(--c-linenD);
  padding-top: 0.6rem;
  position: relative;
  z-index: 1;
}
</style>
