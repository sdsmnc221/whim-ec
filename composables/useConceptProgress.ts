import { ref, computed } from "vue";
import { useConvexClient, useConvexMutation } from "convex-vue";
import { api } from "../convex/_generated/api";
import type { ConceptProgress } from "../types/concept";

export function useConceptProgress() {
  const client = useConvexClient();
  const { mutate: upsert } = useConvexMutation(api.conceptProgress.upsert);

  const records = ref<ConceptProgress[]>([]);

  async function pullFromConvex() {
    const data = await client.query(api.conceptProgress.list, {});
    records.value = (data ?? []).map(
      (r: { conceptId: string; seen: boolean; bookmarked: boolean }) => ({
        conceptId: r.conceptId,
        seen: r.seen,
        bookmarked: r.bookmarked,
      }),
    );
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
        seen: false,
        bookmarked: false,
      }
    );
  }

  async function markSeen(conceptId: string) {
    if (getProgress(conceptId).seen) return;
    await upsert({ conceptId, seen: true });
    await pullFromConvex();
  }

  async function toggleBookmark(conceptId: string) {
    await upsert({ conceptId, bookmarked: !getProgress(conceptId).bookmarked });
    await pullFromConvex();
  }

  const bookmarkedIds = computed(() =>
    [...progressMap.value.values()]
      .filter((p) => p.bookmarked)
      .map((p) => p.conceptId),
  );

  return { records, pullFromConvex, getProgress, markSeen, toggleBookmark, bookmarkedIds };
}
