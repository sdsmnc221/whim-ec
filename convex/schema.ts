import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  conceptProgress: defineTable({
    syncKey: v.string(),
    conceptId: v.string(),
    seen: v.number(),
    bookmarked: v.boolean(),
  })
    .index("by_key", ["syncKey"])
    .index("by_key_concept", ["syncKey", "conceptId"]),

  questionStats: defineTable({
    syncKey: v.string(),
    questionId: v.string(),
    views: v.number(),
    correct: v.number(),
    attempts: v.number(),
    totalTimeMs: v.number(),
  })
    .index("by_key", ["syncKey"])
    .index("by_key_question", ["syncKey", "questionId"]),
});
