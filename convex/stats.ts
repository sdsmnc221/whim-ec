import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getStats = query({
  args: { syncKey: v.string() },
  handler: async (ctx, { syncKey }) => {
    const rows = await ctx.db
      .query("questionStats")
      .withIndex("by_key", (q) => q.eq("syncKey", syncKey))
      .collect();

    return Object.fromEntries(
      rows.map((r) => [
        r.questionId,
        {
          views: r.views,
          correct: r.correct,
          attempts: r.attempts,
          totalTimeMs: r.totalTimeMs,
        },
      ]),
    );
  },
});
export const recordSession = mutation({
  args: {
    syncKey: v.string(),
    results: v.array(
      v.object({
        questionId: v.string(),
        correct: v.boolean(),
        timeMs: v.number(),
      }),
    ),
  },
  handler: async (ctx, { syncKey, results }) => {
    for (const r of results) {
      const existing = await ctx.db
        .query("questionStats")
        .withIndex("by_key_question", (q) =>
          q.eq("syncKey", syncKey).eq("questionId", r.questionId),
        )
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          views: existing.views + 1,
          correct: existing.correct + (r.correct ? 1 : 0),
          attempts: existing.attempts + 1,
          totalTimeMs: existing.totalTimeMs + r.timeMs,
        });
      } else {
        await ctx.db.insert("questionStats", {
          syncKey,
          questionId: r.questionId,
          views: 1,
          correct: r.correct ? 1 : 0,
          attempts: 1,
          totalTimeMs: r.timeMs,
        });
      }
    }
  },
});
