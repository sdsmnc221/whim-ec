import { ref, computed } from "vue";
import { useConvexClient, useConvexMutation } from "convex-vue";
import { api } from "../convex/_generated/api";
import type { ConceptProgress } from "../types/concept";

const LS_KEY = "whimec-concept-progress";
const LS_SYNC_KEY = "whimec-sync-key";

export function useConceptProgress() {
  const client = useConvexClient();
  const { mutate: upsertFn } = useConvexMutation(api.conceptProgress.upsert);

  const records = ref<ConceptProgress[]>(
    import.meta.client
      ? (JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as ConceptProgress[])
      : [],
  );

  function getSyncKey(): string | null {
    return import.meta.client ? localStorage.getItem(LS_SYNC_KEY) : null;
  }

  async function pullFromConvex() {
    const syncKey = getSyncKey();
    if (!syncKey) return;
    const data = await client.query(api.conceptProgress.list, { syncKey });
    records.value = (data ?? []).map(
      (r: { conceptId: string; seen: number; bookmarked: boolean }) => ({
        conceptId: r.conceptId,
        seen: r.seen,
        bookmarked: r.bookmarked,
      }),
    );
    localStorage.setItem(LS_KEY, JSON.stringify(records.value));
  }

  const progressMap = computed(() => {
    const map = new Map<string, ConceptProgress>();
    for (const r of records.value) {
      map.set(r.conceptId, r);
    }
    return map;
  });

  function getProgress(conceptId: string): ConceptProgress {
    return (
      progressMap.value.get(conceptId) ?? {
        conceptId,
        seen: 0,
        bookmarked: false,
      }
    );
  }

  function writeLocal(update: ConceptProgress) {
    const existing = records.value.find(
      (r) => r.conceptId === update.conceptId,
    );
    if (existing) {
      Object.assign(existing, update);
    } else {
      records.value.push(update);
    }
    localStorage.setItem(LS_KEY, JSON.stringify(records.value));
  }

  async function markSeen(conceptId: string) {
    const syncKey = getSyncKey();
    const newCount = getProgress(conceptId).seen + 1;
    if (syncKey) {
      await upsertFn({ syncKey, conceptId, seen: newCount });
      await pullFromConvex();
    } else {
      const prev = getProgress(conceptId);
      writeLocal({ ...prev, conceptId, seen: newCount });
    }
  }

  async function toggleBookmark(conceptId: string) {
    const syncKey = getSyncKey();
    const newVal = !getProgress(conceptId).bookmarked;
    if (syncKey) {
      await upsertFn({ syncKey, conceptId, bookmarked: newVal });
      await pullFromConvex();
    } else {
      const prev = getProgress(conceptId);
      writeLocal({ ...prev, conceptId, bookmarked: newVal });
    }
  }

  const bookmarkedIds = computed(() =>
    [...progressMap.value.values()]
      .filter((p) => p.bookmarked)
      .map((p) => p.conceptId),
  );

  const seenIds = computed(() =>
    [...progressMap.value.values()]
      .filter((p) => p.seen > 0)
      .map((p) => p.conceptId),
  );

  return {
    records,
    pullFromConvex,
    getProgress,
    markSeen,
    toggleBookmark,
    bookmarkedIds,
    seenIds,
  };
}
