<template>
  <div :class="$style.screen">
    <!-- sticky header -->
    <div :class="$style.header">
      <TimerStrip :secs="timeLeft" :answered="answeredCount" :total="total" />
      <div v-if="phase === 'review'" :class="$style.reviewBanner">
        <span :class="$style.reviewBannerText">
          Révision {{ reviewIdx + 1 }}/{{ reviewQ.length }} —
          {{ answers[current] === null ? "sans réponse" : "confiance faible" }}
        </span>
        <WhimcBtn variant="danger" :class="$style.finaliseBtn" @click="doFinalise">
          Finaliser →
        </WhimcBtn>
      </div>
    </div>

    <!-- nav dots -->
    <NavDots
      :total="total"
      :answers="answers"
      :flags="flags"
      :current="current"
      @go="current = $event"
    />

    <!-- submit prompt (all answered, exam phase) -->
    <div v-if="showPrompt && phase === 'exam'" :class="$style.submitPrompt">
      <span :class="$style.promptText">Toutes les questions sont répondues.</span>
      <div :class="$style.promptActions">
        <WhimcBtn
          v-if="lowConfCount > 0"
          variant="orange"
          :class="$style.promptBtn"
          @click="triggerSubmit"
        >
          Réviser ({{ lowConfCount }}) →
        </WhimcBtn>
        <WhimcBtn variant="danger" :class="$style.promptBtn" @click="doFinalise">
          Soumettre [S]
        </WhimcBtn>
      </div>
    </div>

    <!-- question -->
    <QuestionCard
      v-if="questions.length"
      :q="questions[current]"
      :idx="current"
      :total="total"
      :answer="answers[current]"
      :flag="flags[current]"
      :revealed="false"
      :phase="phase"
      @answer="handleAnswer"
      @flag="handleFlag"
    />

    <!-- bottom nav -->
    <div :class="$style.bottomNav">
      <template v-if="phase === 'review'">
        <WhimcBtn variant="ghost" :disabled="reviewIdx === 0" @click="reviewNav(-1)">
          ← précédent
        </WhimcBtn>
        <WhimcBtn
          variant="ghost"
          :disabled="reviewIdx === reviewQ.length - 1"
          @click="reviewNav(1)"
        >
          suivant →
        </WhimcBtn>
      </template>
      <template v-else>
        <WhimcBtn
          variant="ghost"
          :disabled="current === 0"
          @click="current = Math.max(0, current - 1)"
        >
          ← précédent
        </WhimcBtn>
        <WhimcBtn
          v-if="current < total - 1"
          variant="outline"
          @click="current = Math.min(total - 1, current + 1)"
        >
          suivant →
        </WhimcBtn>
        <WhimcBtn v-else variant="danger" @click="triggerSubmit">
          soumettre [S]
        </WhimcBtn>
      </template>
    </div>

    <!-- status bar -->
    <div :class="$style.statusBar">
      <span>{{ answeredCount }}/{{ total }} répondu</span>
      <span v-if="lowConfCount > 0" :class="$style.statusOrange">
        ~ {{ lowConfCount }} confiance faible
      </span>
      <span v-if="unansweredCount > 0" :class="$style.statusRouge">
        ⚠ {{ unansweredCount }} sans réponse
      </span>
      <button
        v-if="phase === 'exam' && answeredCount > 0"
        :class="$style.submitInline"
        @click="triggerSubmit"
      >
        [S] soumettre
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { BuiltQuestion } from "../../composables/useExamEngine";
import { EXAM_SECS } from "../../composables/useExamEngine";
import TimerStrip from "./TimerStrip.vue";
import NavDots from "./NavDots.vue";
import QuestionCard from "./QuestionCard.vue";
import WhimcBtn from "../ui/WhimcBtn.vue";

const props = defineProps<{
  questions: BuiltQuestion[];
}>();

const emit = defineEmits<{
  finalise: [result: { answers: (number | null)[]; flags: (string | null)[]; timeUsed: number }];
}>();

const total = computed(() => props.questions.length);

const answers = ref<(number | null)[]>(Array(total.value).fill(null));
const flags = ref<(string | null)[]>(Array(total.value).fill(null));
const current = ref(0);
const timeLeft = ref(EXAM_SECS);
const phase = ref<"exam" | "review">("exam");
const reviewQ = ref<number[]>([]);
const reviewIdx = ref(0);
const showPrompt = ref(false);

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timer = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      clearTimer();
      doFinalise();
    }
  }, 1000);
});

onUnmounted(clearTimer);

function clearTimer() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

const answeredCount = computed(() => answers.value.filter((a) => a !== null).length);
const lowConfCount = computed(() => flags.value.filter((f) => f === "low-confidence").length);
const unansweredCount = computed(() => answers.value.filter((a) => a === null).length);

function handleAnswer(i: number) {
  if (phase.value !== "exam" && phase.value !== "review") return;
  answers.value[current.value] = i;

  if (phase.value === "exam") {
    setTimeout(() => {
      const next = answers.value.findIndex((a, idx) => idx > current.value && a === null);
      if (next !== -1) {
        current.value = next;
      } else {
        const firstUnanswered = answers.value.findIndex((a) => a === null);
        if (firstUnanswered === -1) {
          showPrompt.value = true;
        } else {
          current.value = firstUnanswered;
        }
      }
    }, 250);
  }
}

function handleFlag() {
  flags.value[current.value] =
    flags.value[current.value] === "low-confidence" ? null : "low-confidence";
}

function triggerSubmit() {
  clearTimer();
  showPrompt.value = false;
  const toReview: number[] = [];
  answers.value.forEach((a, i) => {
    if (flags.value[i] === "low-confidence" || a === null) toReview.push(i);
  });
  if (toReview.length === 0) {
    doFinalise();
  } else {
    reviewQ.value = toReview;
    reviewIdx.value = 0;
    current.value = toReview[0];
    phase.value = "review";
  }
}

function doFinalise() {
  clearTimer();
  emit("finalise", {
    answers: answers.value,
    flags: flags.value,
    timeUsed: EXAM_SECS - timeLeft.value,
  });
}

function reviewNav(dir: -1 | 1) {
  const next = Math.max(0, Math.min(reviewQ.value.length - 1, reviewIdx.value + dir));
  reviewIdx.value = next;
  current.value = reviewQ.value[next];
}
</script>

<style lang="scss" module>
@use "../../styles/tokens" as *;

.screen {
  position: relative;
  min-height: 100vh;
  padding: 1rem 1.25rem 5rem;
  font-family: var(--f-mono);
  color: var(--c-encre);

  @include linen-bg;
}

.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--c-linen);
  padding-bottom: 0.5rem;
  padding-top: 0.2rem;
}

.reviewBanner {
  margin-top: 0.4rem;
  background-color: #fdf6e3;
  border: 1px dashed var(--c-orange);
  padding: 0.45rem 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reviewBannerText {
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.78rem;
  color: var(--c-orange);
}

.finaliseBtn {
  font-size: 0.65rem !important;
  padding: 0.3rem 0.6rem !important;
}

.submitPrompt {
  background-color: #f0f4ff;
  border: 1px dashed var(--c-bleu);
  padding: 0.65rem 0.85rem;
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.promptText {
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.8rem;
  color: var(--c-bleu);
}

.promptActions {
  display: flex;
  gap: 0.4rem;
}

.promptBtn {
  font-size: 0.65rem !important;
  padding: 0.3rem 0.55rem !important;
}

.bottomNav {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.statusBar {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  font-family: var(--f-mono);
  font-size: 0.58rem;
  color: var(--c-sepia);
  flex-wrap: wrap;
}

.statusOrange {
  color: var(--c-orange);
}

.statusRouge {
  color: var(--c-rouge);
}

.submitInline {
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--f-mono);
  font-size: 0.58rem;
  color: var(--c-rouge);
  padding: 0;
}
</style>
