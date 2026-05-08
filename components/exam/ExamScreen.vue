<template>
  <div :class="$style.screen">
    <!-- Block summary (full-screen, replaces exam UI) -->
    <BlockSummaryScreen
      v-if="phase === 'block-summary'"
      :block-index="blockIndex"
      :total-blocks="totalBlocks"
      :correct="lastBlockScore.correct"
      :total="lastBlockScore.total"
      @continue="continueToNextBlock"
    />

    <template v-else>
      <!-- sticky header -->
      <div :class="$style.header">
        <TimerStrip
          :secs="timeLeft"
          :answered="blockAnsweredCount"
          :total="blockSize"
        />
        <div v-if="totalBlocks > 1" :class="$style.blockBadge">
          Bloc {{ blockIndex + 1 }}/{{ totalBlocks }}
        </div>
        <div v-if="phase === 'review'" :class="$style.reviewBanner">
          <span :class="$style.reviewBannerText">
            Révision {{ reviewIdx + 1 }}/{{ reviewQ.length }} —
            {{
              answers[current] === null ? "sans réponse" : "confiance faible"
            }}
          </span>
          <WhimcBtn
            variant="danger"
            :class="$style.finaliseBtn"
            @click="doFinalise"
          >
            Finaliser →
          </WhimcBtn>
        </div>
      </div>

      <!-- nav dots (block-scoped) -->
      <NavDots
        :total="blockSize"
        :answers="blockAnswers"
        :flags="blockFlags"
        :current="current - blockStart"
        @go="navTo($event + blockStart)"
      />

      <!-- submit prompt -->
      <div v-if="showPrompt && phase === 'exam'" :class="$style.submitPrompt">
        <span :class="$style.promptText">
          {{
            isLastBlock
              ? "Toutes les questions sont répondues."
              : `Bloc ${blockIndex + 1}/${totalBlocks} terminé.`
          }}
        </span>
        <div :class="$style.promptActions">
          <template v-if="isLastBlock">
            <WhimcBtn
              v-if="lowConfCount > 0"
              variant="orange"
              :class="$style.promptBtn"
              @click="triggerSubmit"
            >
              Réviser ({{ lowConfCount }}) →
            </WhimcBtn>
            <WhimcBtn
              variant="danger"
              :class="$style.promptBtn"
              @click="doFinalise"
            >
              Soumettre [S]
            </WhimcBtn>
          </template>
          <WhimcBtn
            v-else
            variant="primary"
            :class="$style.promptBtn"
            @click="endBlock"
          >
            Bloc suivant →
          </WhimcBtn>
        </div>
      </div>

      <!-- question (block-local idx) -->
      <QuestionCard
        v-if="questions.length"
        :q="questions[current]"
        :idx="current - blockStart"
        :total="blockSize"
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
          <WhimcBtn
            variant="ghost"
            :disabled="reviewIdx === 0"
            @click="reviewNav(-1)"
          >
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
            :disabled="current === blockStart"
            @click="navPrev"
          >
            ← précédent
          </WhimcBtn>
          <WhimcBtn
            v-if="current < blockEnd - 1"
            variant="outline"
            @click="navNext"
          >
            suivant →
          </WhimcBtn>
          <WhimcBtn v-else variant="danger" @click="triggerSubmit">
            {{ isLastBlock ? "soumettre [S]" : "fin du bloc →" }}
          </WhimcBtn>
        </template>
      </div>

      <!-- status bar -->
      <div :class="$style.statusBar">
        <span>{{ blockAnsweredCount }}/{{ blockSize }} répondu</span>
        <span v-if="lowConfCount > 0" :class="$style.statusOrange">
          ~ {{ lowConfCount }} confiance faible
        </span>
        <span v-if="blockUnansweredCount > 0" :class="$style.statusRouge">
          ⚠ {{ blockUnansweredCount }} sans réponse
        </span>
        <button
          v-if="phase === 'exam' && blockAnsweredCount > 0"
          :class="$style.submitInline"
          @click="triggerSubmit"
        >
          {{ isLastBlock ? "[S]oumettre" : "[F]in du bloc" }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import type { BuiltQuestion } from "../../composables/useExamEngine";
import { EXAM_SECS, computeScore } from "../../composables/useExamEngine";
import TimerStrip from "./TimerStrip.vue";
import NavDots from "./NavDots.vue";
import QuestionCard from "./QuestionCard.vue";
import WhimcBtn from "../ui/WhimcBtn.vue";
import BlockSummaryScreen from "./BlockSummaryScreen.vue";

const props = defineProps<{
  questions: BuiltQuestion[];
  totalBlocks?: number;
}>();

const totalBlocks = computed(() => props.totalBlocks ?? 1);

const emit = defineEmits<{
  finalise: [
    result: {
      answers: (number | null)[];
      flags: (string | null)[];
      timeUsed: number;
      timesMs: number[];
      blockScores: { correct: number; total: number }[];
    },
  ];
}>();

const total = computed(() => props.questions.length);
const totalSecs = computed(() => EXAM_SECS * totalBlocks.value);

const answers = ref<(number | null)[]>(Array(total.value).fill(null));
const flags = ref<(string | null)[]>(Array(total.value).fill(null));
const current = ref(0);
const timeLeft = ref(totalSecs.value);
const phase = ref<"exam" | "review" | "block-summary">("exam");
const reviewQ = ref<number[]>([]);
const reviewIdx = ref(0);
const showPrompt = ref(false);

const blockIndex = ref(0);
const blockScores = ref<{ correct: number; total: number }[]>([]);

const questionStartedAt = ref<number>(Date.now());
const timesMs = ref<number[]>(Array(total.value).fill(0));

let timer: ReturnType<typeof setInterval> | null = null;
let autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

// Block boundaries
const blockStart = computed(() => blockIndex.value * 40);
const blockEnd = computed(() => Math.min(blockStart.value + 40, total.value));
const blockSize = computed(() => blockEnd.value - blockStart.value);
const isLastBlock = computed(() => blockIndex.value === totalBlocks.value - 1);

// Block-scoped slices for NavDots
const blockAnswers = computed(() =>
  answers.value.slice(blockStart.value, blockEnd.value),
);
const blockFlags = computed(() =>
  flags.value.slice(blockStart.value, blockEnd.value),
);

// Block-scoped counts
const blockAnsweredCount = computed(
  () => blockAnswers.value.filter((a) => a !== null).length,
);
const lowConfCount = computed(
  () => blockFlags.value.filter((f) => f === "low-confidence").length,
);
const blockUnansweredCount = computed(
  () => blockAnswers.value.filter((a) => a === null).length,
);

// Last block score (for BlockSummaryScreen)
const lastBlockScore = computed(
  () =>
    blockScores.value[blockScores.value.length - 1] ?? {
      correct: 0,
      total: 40,
    },
);

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

function cancelAutoAdvance() {
  if (autoAdvanceTimer !== null) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
}

function handleAnswer(i: number) {
  if (phase.value !== "exam" && phase.value !== "review") return;
  answers.value[current.value] = i;

  if (phase.value === "exam") {
    cancelAutoAdvance();
    const answeredAt = current.value;
    autoAdvanceTimer = setTimeout(() => {
      autoAdvanceTimer = null;
      if (current.value !== answeredAt) return;
      const next = answers.value.findIndex(
        (a, idx) => idx > current.value && idx < blockEnd.value && a === null,
      );
      if (next !== -1) {
        current.value = next;
      } else {
        const firstUnanswered = answers.value.findIndex(
          (a, idx) =>
            idx >= blockStart.value && idx < blockEnd.value && a === null,
        );
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
  showPrompt.value = false;
  if (!isLastBlock.value) {
    endBlock();
    return;
  }
  clearTimer();
  const toReview: number[] = [];
  for (let i = blockStart.value; i < blockEnd.value; i++) {
    if (flags.value[i] === "low-confidence" || answers.value[i] === null) {
      toReview.push(i);
    }
  }
  if (toReview.length === 0) {
    doFinalise();
  } else {
    reviewQ.value = toReview;
    reviewIdx.value = 0;
    current.value = toReview[0];
    phase.value = "review";
  }
}

function endBlock() {
  timesMs.value[current.value] += Date.now() - questionStartedAt.value;
  questionStartedAt.value = Date.now(); // prevent watch double-count on block transition
  const blockQs = props.questions.slice(blockStart.value, blockEnd.value);
  const blockAns = answers.value.slice(blockStart.value, blockEnd.value);
  const { correct, total: bt } = computeScore(blockQs, blockAns);
  blockScores.value.push({ correct, total: bt });
  phase.value = "block-summary";
}

function continueToNextBlock() {
  blockIndex.value++;
  current.value = blockStart.value;
  questionStartedAt.value = Date.now();
  phase.value = "exam";
  showPrompt.value = false;
}

function doFinalise() {
  timesMs.value[current.value] += Date.now() - questionStartedAt.value;
  clearTimer();
  const blockQs = props.questions.slice(blockStart.value, blockEnd.value);
  const blockAns = answers.value.slice(blockStart.value, blockEnd.value);
  const { correct, total: bt } = computeScore(blockQs, blockAns);
  blockScores.value.push({ correct, total: bt });
  emit("finalise", {
    answers: answers.value,
    flags: flags.value,
    timeUsed: totalSecs.value - timeLeft.value,
    timesMs: timesMs.value,
    blockScores: blockScores.value,
  });
}

function navTo(n: number) {
  cancelAutoAdvance();
  current.value = Math.max(blockStart.value, Math.min(blockEnd.value - 1, n));
}

function navPrev() {
  cancelAutoAdvance();
  current.value = Math.max(blockStart.value, current.value - 1);
}

function navNext() {
  cancelAutoAdvance();
  current.value = Math.min(blockEnd.value - 1, current.value + 1);
}

function reviewNav(dir: -1 | 1) {
  cancelAutoAdvance();
  const next = Math.max(
    0,
    Math.min(reviewQ.value.length - 1, reviewIdx.value + dir),
  );
  reviewIdx.value = next;
  current.value = reviewQ.value[next];
}

watch(current, (_new, old) => {
  timesMs.value[old] += Date.now() - questionStartedAt.value;
  questionStartedAt.value = Date.now();
});
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

.blockBadge {
  font-family: var(--f-mono);
  font-size: 0.5rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--c-sepia);
  margin-top: 0.2rem;
  text-align: right;
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
