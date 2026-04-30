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
          40 questions · 28 connaissances + 12 mises en situation · 45 min · seuil 80 %
        </div>
      </div>

      <WhimcPatch accent="var(--c-bleu)">
        <div :class="$style.patchHeading">règles — mode super-hard</div>
        <div v-for="([k, v], index) in RULES" :key="`rules-${index}`" :class="$style.rule">
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
            :class="[$style.sourceBtn, datasetSource === opt.value && $style.sourceBtnActive]"
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
          <span v-if="fileError" :class="$style.fileError">{{ fileError }}</span>
        </div>
      </WhimcPatch>

      <WhimcPatch>
        <div :class="$style.patchHeading">filtrer par thème</div>
        <div :class="$style.themesContainer">
          <button
            v-for="(theme, index) in THEMES"
            :key="`ec-theme-${index}`"
            :class="[$style.themeBtn, index === themeSetIndex && $style.themeBtnActive]"
            @click="themeSetIndex = index"
          >
            {{ themeSetIndex === index ? "× " : "" }}{{ theme }}
          </button>
        </div>
      </WhimcPatch>

      <WhimcBtn variant="primary" :class="$style.btnStart" :disabled="!canStart" @click="handleStart">
        commencer l'examen →
      </WhimcBtn>

      <footer :class="$style.footer">× liberté × égalité × fraternité ×</footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { THEMES, RULES } from "../../utils/constants";
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
const SS_CONTENT_KEY = "whimec-dataset-content";

const themeSetIndex = ref(0);
const datasetSource = ref<DatasetSource>("bundled");
const datasetUrl = ref("");
const fileName = ref("");
const fileError = ref("");

onMounted(() => {
  const savedSource = localStorage.getItem(LS_SOURCE_KEY) as DatasetSource | null;
  if (savedSource) datasetSource.value = savedSource;
  const savedUrl = localStorage.getItem(LS_URL_KEY);
  if (savedUrl) datasetUrl.value = savedUrl;
});

watch(datasetSource, (v) => localStorage.setItem(LS_SOURCE_KEY, v));
watch(datasetUrl, (v) => localStorage.setItem(LS_URL_KEY, v));

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

function handleStart() {
  sessionStorage.setItem("examReady", "1");
  sessionStorage.setItem("datasetSource", datasetSource.value);
  if (datasetSource.value === "url") {
    sessionStorage.setItem("datasetUrl", datasetUrl.value.trim());
  }
  navigateTo({ path: "/exam", state: { theme: themeSetIndex.value } });
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
