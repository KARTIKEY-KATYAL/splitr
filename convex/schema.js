import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
    imageUrl: v.optional(v.string()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .searchIndex("search_name", { searchField: "name" })
    .searchIndex("search_email", { searchField: "email" }),

  // Expenses
  expenses: defineTable({
    description: v.string(),
    amount: v.number(),
    category: v.optional(v.string()),
    date: v.number(), // timestamp
    paidByUserId: v.id("users"), // Reference to users table
    splitType: v.string(), // "equal", "percentage", "exact"
    splits: v.array(
      v.object({
        userId: v.id("users"), // Reference to users table
        amount: v.number(), // amount owed by this user
        paid: v.boolean(),
      })
    ),
    groupId: v.optional(v.id("groups")), // null for one-on-one expenses
    createdBy: v.id("users"), // Reference to users table
    // New fields for receipt scanning
    receiptImageUrl: v.optional(v.string()),
    receiptData: v.optional(
      v.object({
        extractedText: v.optional(v.string()),
        confidence: v.optional(v.number()),
        merchantName: v.optional(v.string()),
        extractedAmount: v.optional(v.number()),
      })
    ),
    // Recurring expense reference
    recurringExpenseId: v.optional(v.id("recurringExpenses")),
  })
    .index("by_group", ["groupId"])
    .index("by_user_and_group", ["paidByUserId", "groupId"])
    .index("by_date", ["date"])
    .index("by_category", ["category"])
    .index("by_recurring", ["recurringExpenseId"]),

  // Settlements
  settlements: defineTable({
    amount: v.number(),
    note: v.optional(v.string()),
    date: v.number(), // timestamp
    paidByUserId: v.id("users"), // Reference to users table
    receivedByUserId: v.id("users"), // Reference to users table
    groupId: v.optional(v.id("groups")), // null for one-on-one settlements
    relatedExpenseIds: v.optional(v.array(v.id("expenses"))), // Which expenses this settlement covers
    createdBy: v.id("users"), // Reference to users table
  })
    .index("by_group", ["groupId"])
    .index("by_user_and_group", ["paidByUserId", "groupId"])
    .index("by_receiver_and_group", ["receivedByUserId", "groupId"])
    .index("by_date", ["date"]),

  // Groups
  groups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"), // Reference to users table
    members: v.array(
      v.object({
        userId: v.id("users"), // Reference to users table
        role: v.string(), // "admin" or "member"
        joinedAt: v.number(),
      })
    ),
  }),

  // New tables for features

  // Budget tracking
  budgets: defineTable({
    userId: v.id("users"),
    category: v.string(),
    monthlyLimit: v.number(),
    year: v.number(),
    month: v.number(), // 0-11
    spent: v.number(), // current spent amount
    lastUpdated: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_month", ["userId", "year", "month"])
    .index("by_category", ["category"]),

  // Recurring expenses
  recurringExpenses: defineTable({
    userId: v.id("users"),
    description: v.string(),
    amount: v.number(),
    category: v.string(),
    frequency: v.string(), // "weekly", "monthly", "yearly", "biweekly"
    participants: v.array(v.id("users")),
    groupId: v.optional(v.id("groups")),
    nextDue: v.number(), // timestamp
    lastCreated: v.optional(v.number()), // timestamp of last auto-created expense
    isActive: v.boolean(),
    splitType: v.string(), // "equal", "percentage", "exact"
    splits: v.array(
      v.object({
        userId: v.id("users"),
        amount: v.number(),
        percentage: v.optional(v.number()),
      })
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_next_due", ["nextDue"])
    .index("by_active", ["isActive"]),

  // Smart expense suggestions
  expenseSuggestions: defineTable({
    userId: v.id("users"),
    description: v.string(),
    category: v.string(),
    avgAmount: v.number(),
    frequency: v.string(), // "daily", "weekly", "monthly"
    lastSuggested: v.number(),
    confidence: v.number(), // 0-1 score
    basedOnExpenses: v.array(v.id("expenses")), // expenses this suggestion is based on
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_confidence", ["confidence"])
    .index("by_category", ["category"]),

  // Analytics cache
  analyticsCache: defineTable({
    userId: v.id("users"),
    timeRange: v.string(), // "week", "month", "year"
    data: v.object({
      totalSpent: v.number(),
      avgExpense: v.number(),
      topCategory: v.optional(
        v.object({
          name: v.string(),
          amount: v.number(),
        })
      ),
      categoryBreakdown: v.array(
        v.object({
          name: v.string(),
          amount: v.number(),
          percentage: v.number(),
          color: v.string(),
        })
      ),
      spentTrend: v.number(),
      avgTrend: v.number(),
      budgetStatus: v.optional(v.string()),
      budgetDiff: v.optional(v.number()),
    }),
    lastUpdated: v.number(),
  })
    .index("by_user_range", ["userId", "timeRange"])
    .index("by_last_updated", ["lastUpdated"]),
});
