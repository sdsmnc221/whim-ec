import { ref } from "vue";
import { useConvexClient, useConvexMutation } from "convex-vue";
import { api } from "../convex/_generated/api";
import { type BuiltQuestion } from "./useExamEngine";

interface Stats {
  views: number;
  correct: number;
  attempts: number;
  totalTimeMs: number;
}

type StatsMap = Record<string, Stats>;

const LS_KEY = "whimec-stats";
const LS_SYNC_KEY = "whimec-sync-key";

export const useStats = () => {
  const syncKey = ref<string | null>(
    import.meta.client ? localStorage.getItem(LS_SYNC_KEY) : null,
  );
  const stats = ref<StatsMap>(
    import.meta.client ? JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") : {},
  );

  const client = useConvexClient();
  const { mutate: pushSession } = useConvexMutation(api.stats.recordSession);

  async function pullFromConvex() {
    if (!syncKey.value || !import.meta.client) return;
    const remote = await client.query(api.stats.getStats, { syncKey: syncKey.value });
    stats.value = { ...stats.value, ...remote };
    localStorage.setItem(LS_KEY, JSON.stringify(stats.value));
  }

  async function recordSession(
    questions: BuiltQuestion[],
    answers: (number | null)[],
    timesMs: number[],
  ) {
    if (!import.meta.client) return;

    const results = questions.map((q, i) => ({
      questionId: q.id,
      correct: answers[i] === q.correctDisplayIndex,
      timeMs: timesMs[i] ?? 0,
    }));

    if (syncKey.value) {
      // Convex is the single counter — push delta, then pull authoritative state.
      // Do NOT also increment locally, otherwise both sides accumulate independently.
      await pushSession({ syncKey: syncKey.value, results });
      await pullFromConvex();
    } else {
      for (const r of results) {
        const prev = stats.value[r.questionId] ?? {
          views: 0,
          correct: 0,
          attempts: 0,
          totalTimeMs: 0,
        };
        stats.value[r.questionId] = {
          views: prev.views + 1,
          correct: prev.correct + (r.correct ? 1 : 0),
          attempts: prev.attempts + 1,
          totalTimeMs: prev.totalTimeMs + r.timeMs,
        };
      }
      localStorage.setItem(LS_KEY, JSON.stringify(stats.value));
    }
  }

  function setSyncKey(key: string) {
    syncKey.value = key;
    if (import.meta.client) localStorage.setItem(LS_SYNC_KEY, key);
    pullFromConvex();
  }

  function generateSyncKey() {
    setSyncKey(crypto.randomUUID());
  }

  return { stats, syncKey, pullFromConvex, recordSession, setSyncKey, generateSyncKey };
};
