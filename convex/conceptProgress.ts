import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: { syncKey: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("conceptProgress")
      .withIndex("by_key", (q) => q.eq("syncKey", args.syncKey))
      .collect(),
});

export const upsert = mutation({
  args: {
    syncKey: v.string(),
    conceptId: v.string(),
    seen: v.optional(v.number()),
    bookmarked: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("conceptProgress")
      .withIndex("by_key_concept", (q) =>
        q.eq("syncKey", args.syncKey).eq("conceptId", args.conceptId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(args.seen !== undefined && { seen: args.seen }),
        ...(args.bookmarked !== undefined && { bookmarked: args.bookmarked }),
      });
    } else {
      await ctx.db.insert("conceptProgress", {
        syncKey: args.syncKey,
        conceptId: args.conceptId,
        seen: args.seen ?? 0,
        bookmarked: args.bookmarked ?? false,
      });
    }
  },
});
