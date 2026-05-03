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
          40 questions · 45 min · seuil 80 %
        </div>
      </div>

      <!-- ── Apprendre ── -->
      <div :class="$style.sectionHeading">apprendre</div>

      <WhimcBtn variant="outline" :class="$style.btnTimeline" @click="navigateTo('/timeline')">
        timeline civique →
      </WhimcBtn>

      <!-- ── divider ── -->
      <div :class="$style.divider"><span>×</span></div>

      <!-- ── Test ── -->
      <div :class="$style.sectionHeading">test</div>

      <WhimcPatch accent="var(--c-bleu)">
        <div :class="$style.patchHeading">règles — mode super-hard</div>
        <div
          v-for="([k, v], index) in RULES"
          :key="`rules-${index}`"
          :class="$style.rule"
        >
          <span :class="$style.ruleKey">{{ k }}</span>
          <span :class="$style.ruleVal">{{ v }}</span>
        </div>
      </WhimcPatch>

      <WhimcPatch>
        <div :class="$style.patchHeading">source du dataset</div>
        <div :class="$style.sourceOptions">
          <button
            v-for="opt in SOURCE_OPTIONS"
            :key="opt.value"
            :class="[
              $style.sourceBtn,
              datasetSource === opt.value && $style.sourceBtnActive,
            ]"
            @click="datasetSource = opt.value"
          >
            {{ datasetSource === opt.value ? "× " : "" }}{{ opt.label }}
          </button>
        </div>

        <div v-if="datasetSource === 'url'" :class="$style.urlRow">
          <input
            v-model="datasetUrl"
            :class="$style.urlInput"
            type="url"
            placeholder="https://raw.githubusercontent.com/…/dataset.json"
          />
        </div>

        <div v-if="datasetSource === 'file'" :class="$style.fileRow">
          <label :class="$style.fileLabel">
            <input
              type="file"
              accept=".json"
              :class="$style.fileInputHidden"
              @change="handleFileSelect"
            />
            {{ fileName || "choisir un fichier .json →" }}
          </label>
          <span v-if="fileError" :class="$style.fileError">{{
            fileError
          }}</span>
        </div>
      </WhimcPatch>

      <WhimcPatch>
        <div :class="$style.patchHeading">filtrer par thème</div>
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
      </WhimcPatch>

      <WhimcPatch>
        <div :class="$style.patchHeading">synchronisation des stats</div>
        <div :class="$style.syncStatus">
          <span
            :class="$style.syncDot"
            :style="{
              background: syncKey ? 'var(--c-vert)' : 'var(--c-linenD)',
            }"
          />
          <span>{{
            syncKey
              ? "clé active — stats synchro multi-appareils"
              : "hors-ligne — stats locales uniquement"
          }}</span>
        </div>
        <div :class="$style.syncInputRow">
          <input
            v-model="syncKey"
            :class="$style.syncInput"
            type="password"
            placeholder="coller votre clé de sync →"
            autocomplete="off"
          />
        </div>
        <div :class="$style.syncActions">
          <button :class="$style.syncBtn" @click="generateSyncKey">
            générer
          </button>
          <button
            :class="[$style.syncBtn, !syncKey && $style.syncBtnDisabled]"
            :disabled="!syncKey"
            @click="copySyncKey"
          >
            {{ copied ? "× copié !" : "copier" }}
          </button>
        </div>

        <div v-if="statsDist.total > 0" :class="$style.statsDist">
          <div :class="$style.statsDistRow">
            <span :class="$style.statsDistLabel">maîtrisé</span>
            <span :class="[$style.statsDistCount, $style.statsMaitrise]">{{
              statsDist.maitrise
            }}</span>
          </div>
          <div :class="$style.statsDistRow">
            <span :class="$style.statsDistLabel">fragile</span>
            <span :class="[$style.statsDistCount, $style.statsFragile]">{{
              statsDist.fragile
            }}</span>
          </div>
          <div :class="$style.statsDistRow">
            <span :class="$style.statsDistLabel">zone rouge</span>
            <span :class="[$style.statsDistCount, $style.statsRouge]">{{
              statsDist.rouge
            }}</span>
          </div>
          <div :class="$style.statsDistSep" />
          <div :class="$style.statsDistRow">
            <span :class="$style.statsDistLabel">questions vues</span>
            <span :class="$style.statsDistCount">{{ statsDist.total }}</span>
          </div>
        </div>
        <div v-else :class="$style.statsEmpty">aucune session enregistrée</div>
      </WhimcPatch>

      <WhimcBtn
        variant="primary"
        :class="$style.btnStart"
        :disabled="!canStart"
        @click="handleStart"
      >
        commencer l'examen →
      </WhimcBtn>

      <footer :class="$style.footer">× liberté × égalité × fraternité ×</footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { THEMES, RULES } from "../../utils/constants";
import { useStats } from "../../composables/useStats";
import CrossStitch from "../ui/CrossStitch.vue";
import WhimcPatch from "../ui/WhimcPatch.vue";
import WhimcBtn from "../ui/WhimcBtn.vue";

type DatasetSource = "bundled" | "url" | "file";

const SOURCE_OPTIONS: { value: DatasetSource; label: string }[] = [
  { value: "bundled", label: "échantillon intégré" },
  { value: "url", label: "URL" },
  { value: "file", label: "fichier" },
];

const LS_SOURCE_KEY = "whimec-dataset-source";
const LS_URL_KEY = "whimec-dataset-url";
const LS_SYNC_KEY = "whimec-sync-key";
const LS_THEMES_KEY = "whimec-themes";
const SS_CONTENT_KEY = "whimec-dataset-content";

const THEMES_SUB = THEMES.slice(1);
const selectedThemes = ref<string[]>([...THEMES_SUB]);

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
const datasetSource = ref<DatasetSource>("bundled");
const datasetUrl = ref("");
const fileName = ref("");
const fileError = ref("");
const syncKey = ref("");
const copied = ref(false);

const { stats: questionStats, pullFromConvex, setSyncKey } = useStats();

const SPEED_MAX_MS = 60_000;
const VIEWS_MAX = 20;

function difficultyScore(q: {
  views: number;
  correct: number;
  attempts: number;
  totalTimeMs: number;
}): number {
  if (q.attempts === 0) return 0.5;
  const errorRate = (q.attempts - q.correct) / q.attempts;
  const speedNorm = Math.min(q.totalTimeMs / q.attempts / SPEED_MAX_MS, 1);
  const viewsNorm = Math.min(q.views / VIEWS_MAX, 1);
  return errorRate * 0.5 + speedNorm * 0.3 + viewsNorm * 0.2;
}

const statsDist = computed(() => {
  const entries = Object.values(questionStats.value);
  const dist = { maitrise: 0, fragile: 0, rouge: 0 };
  for (const q of entries) {
    const score = difficultyScore(q);
    if (score < 0.3) dist.maitrise++;
    else if (score < 0.6) dist.fragile++;
    else dist.rouge++;
  }
  return { ...dist, total: entries.length };
});

onMounted(() => {
  const savedSource = localStorage.getItem(
    LS_SOURCE_KEY,
  ) as DatasetSource | null;
  if (savedSource) datasetSource.value = savedSource;
  const savedUrl = localStorage.getItem(LS_URL_KEY);
  if (savedUrl) datasetUrl.value = savedUrl;
  const savedSyncKey = localStorage.getItem(LS_SYNC_KEY);
  if (savedSyncKey) syncKey.value = savedSyncKey;
  const savedThemes = localStorage.getItem(LS_THEMES_KEY);
  if (savedThemes) {
    try {
      const parsed: string[] = JSON.parse(savedThemes);
      selectedThemes.value = parsed.filter((t) => THEMES_SUB.includes(t));
    } catch {}
  }
  pullFromConvex();
});

watch(datasetSource, (v) => localStorage.setItem(LS_SOURCE_KEY, v));
watch(datasetUrl, (v) => localStorage.setItem(LS_URL_KEY, v));
watch(selectedThemes, (v) =>
  localStorage.setItem(LS_THEMES_KEY, JSON.stringify(v)),
);
watch(syncKey, (v) => {
  localStorage.setItem(LS_SYNC_KEY, v);
  if (v) setSyncKey(v);
});

function handleFileSelect(e: Event) {
  fileError.value = "";
  fileName.value = "";
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const raw = ev.target?.result as string;
      JSON.parse(raw);
      sessionStorage.setItem(SS_CONTENT_KEY, raw);
      fileName.value = file.name;
    } catch {
      fileError.value = "fichier JSON invalide";
    }
  };
  reader.readAsText(file);
}

const canStart = computed(() => {
  if (datasetSource.value === "url") return datasetUrl.value.trim().length > 0;
  if (datasetSource.value === "file") return fileName.value.length > 0;
  return true;
});

function generateSyncKey() {
  syncKey.value = crypto.randomUUID();
}

async function copySyncKey() {
  if (!syncKey.value) return;
  await navigator.clipboard.writeText(syncKey.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

function handleStart() {
  sessionStorage.setItem("examReady", "1");
  sessionStorage.setItem("datasetSource", datasetSource.value);
  if (datasetSource.value === "url") {
    sessionStorage.setItem("datasetUrl", datasetUrl.value.trim());
  }
  sessionStorage.setItem("examThemes", JSON.stringify(selectedThemes.value));
  navigateTo("/exam");
}
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

.patchHeading {
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
  border-bottom: 1px dashed var(--c-linenD);
  padding: 0.32rem 0;
}

.ruleKey {
  font-family: var(--f-display);
  font-size: 0.92rem;
  color: var(--c-bleu);
}

.ruleVal {
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.72rem;
  color: var(--c-sepia);
  text-align: right;
  max-width: 55%;
}

.sourceOptions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.sourceBtn {
  background: transparent;
  border: 1px dashed var(--c-linenD);
  color: var(--c-encre);
  font-family: var(--f-sans);
  font-size: 0.78rem;
  padding: 0.38rem 0.65rem;
  cursor: pointer;
}

.sourceBtnActive {
  background: var(--c-bleu-pale);
  border-color: var(--c-bleu);
  color: var(--c-bleu);
}

.urlRow {
  margin-top: 0.65rem;
}

.urlInput {
  width: 100%;
  box-sizing: border-box;
  background: var(--c-linen);
  border: 1px dashed var(--c-sepia);
  color: var(--c-encre);
  font-family: var(--f-mono);
  font-size: 0.72rem;
  padding: 0.4rem 0.6rem;
  outline: none;

  &::placeholder {
    color: var(--c-sepia);
    opacity: 0.6;
  }

  &:focus {
    border-color: var(--c-bleu);
  }
}

.fileRow {
  margin-top: 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.fileLabel {
  display: inline-block;
  background: var(--c-linen);
  border: 1px dashed var(--c-sepia);
  color: var(--c-encre);
  font-family: var(--f-mono);
  font-size: 0.72rem;
  padding: 0.4rem 0.65rem;
  cursor: pointer;

  &:hover {
    border-color: var(--c-bleu);
    color: var(--c-bleu);
  }
}

.fileInputHidden {
  display: none;
}

.fileError {
  font-family: var(--f-mono);
  font-size: 0.65rem;
  color: var(--c-rouge);
}

.themesContainer {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.themeBtn {
  background: transparent;
  border: 1px dashed var(--c-linenD);
  color: var(--c-encre);
  font-family: var(--f-sans);
  font-size: 0.78rem;
  text-align: left;
  padding: 0.38rem 0.65rem;
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
  gap: 0.25rem;
  margin-top: 0.1rem;
  padding-left: 0.85rem;
  border-left: 1px dashed var(--c-linenD);
}

.syncStatus {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.72rem;
  color: var(--c-sepia);
  margin-bottom: 0.65rem;
}

.syncDot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.syncInputRow {
  margin-bottom: 0.5rem;
}

.syncInput {
  width: 100%;
  box-sizing: border-box;
  background: var(--c-linen);
  border: 1px dashed var(--c-sepia);
  color: var(--c-encre);
  font-family: var(--f-mono);
  font-size: 0.72rem;
  padding: 0.4rem 0.6rem;
  outline: none;

  &::placeholder {
    color: var(--c-sepia);
    opacity: 0.6;
  }

  &:focus {
    border-color: var(--c-vert);
  }
}

.syncActions {
  display: flex;
  gap: 0.35rem;
}

.syncBtn {
  background: transparent;
  border: 1px dashed var(--c-linenD);
  color: var(--c-encre);
  font-family: var(--f-mono);
  font-size: 0.72rem;
  padding: 0.35rem 0.6rem;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: var(--c-vert);
    color: var(--c-vert);
  }
}

.syncBtnDisabled {
  opacity: 0.4;
  cursor: default;
}

.sectionHeading {
  font-family: var(--f-mono);
  font-size: 0.55rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--c-sepia);
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--c-sepia);
  font-family: var(--f-body);
  font-size: 0.9rem;

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-top: 1px dashed var(--c-linenD);
  }
}

.btnStart {
  font-family: var(--f-display) !important;
  font-size: 1.05rem !important;
  padding: 0.85rem !important;
}

.btnTimeline {
  width: 100%;
  font-size: 0.78rem !important;
}

.footer {
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.7rem;
  color: var(--c-sepia);
  text-align: center;
  margin-top: 2rem;
}

.statsDist {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
}

.statsDistRow {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px dashed var(--c-linenD);
  padding: 0.28rem 0;
}

.statsDistLabel {
  font-family: var(--f-display);
  font-size: 0.88rem;
  color: var(--c-sepia);
}

.statsDistCount {
  font-family: var(--f-mono);
  font-size: 0.78rem;
  color: var(--c-encre);
}

.statsMaitrise {
  color: var(--c-vert);
}

.statsFragile {
  color: var(--c-orange);
}

.statsRouge {
  color: var(--c-rouge);
}

.statsDistSep {
  height: 0.2rem;
}

.statsEmpty {
  margin-top: 0.5rem;
  font-family: var(--f-body);
  font-style: italic;
  font-size: 0.7rem;
  color: var(--c-sepia);
  opacity: 0.6;
}
</style>
