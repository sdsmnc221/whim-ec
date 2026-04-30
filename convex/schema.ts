import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
