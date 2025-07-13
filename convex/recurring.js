import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Create a recurring expense
export const createRecurringExpense = mutation({
  args: {
    description: v.string(),
    amount: v.number(),
    category: v.string(),
    frequency: v.string(),
    participants: v.array(v.id("users")),
    groupId: v.optional(v.id("groups")),
    splitType: v.string(),
    splits: v.array(
      v.object({
        userId: v.id("users"),
        amount: v.number(),
        percentage: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    // Calculate next due date based on frequency
    const now = Date.now();
    let nextDue = now;
    
    switch (args.frequency) {
      case "weekly":
        nextDue = now + 7 * 24 * 60 * 60 * 1000;
        break;
      case "biweekly":
        nextDue = now + 14 * 24 * 60 * 60 * 1000;
        break;
      case "monthly":
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextDue = nextMonth.getTime();
        break;
      case "yearly":
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        nextDue = nextYear.getTime();
        break;
    }
    
    return await ctx.db.insert("recurringExpenses", {
      userId: user._id,
      description: args.description,
      amount: args.amount,
      category: args.category,
      frequency: args.frequency,
      participants: args.participants,
      groupId: args.groupId,
      nextDue,
      lastCreated: null,
      isActive: true,
      splitType: args.splitType,
      splits: args.splits,
      createdAt: now,
    });
  },
});

// Get user's recurring expenses
export const getRecurringExpenses = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const recurringExpenses = await ctx.db
      .query("recurringExpenses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    // Sort by next due date
    recurringExpenses.sort((a, b) => a.nextDue - b.nextDue);
    
    return recurringExpenses;
  },
});

// Toggle recurring expense active status
export const toggleRecurringExpense = mutation({
  args: {
    id: v.id("recurringExpenses"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const recurringExpense = await ctx.db.get(args.id);
    if (!recurringExpense || recurringExpense.userId !== user._id) {
      throw new Error("Recurring expense not found or unauthorized");
    }
    
    await ctx.db.patch(args.id, {
      isActive: args.isActive,
    });
  },
});

// Create expense from recurring template
export const createExpenseFromRecurring = mutation({
  args: {
    recurringId: v.id("recurringExpenses"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const recurring = await ctx.db.get(args.recurringId);
    if (!recurring || recurring.userId !== user._id) {
      throw new Error("Recurring expense not found or unauthorized");
    }
    
    if (!recurring.isActive) {
      throw new Error("Recurring expense is not active");
    }
    
    // Create the expense
    const expenseId = await ctx.runAction(internal.expenses.createExpense, {
      description: recurring.description,
      amount: recurring.amount,
      category: recurring.category,
      date: Date.now(),
      paidByUserId: user._id, // Default to current user as payer
      splitType: recurring.splitType,
      splits: recurring.splits.map(split => ({
        userId: split.userId,
        amount: split.amount,
        paid: split.userId === user._id,
      })),
      groupId: recurring.groupId,
      recurringExpenseId: recurring._id,
    });
    
    // Update the recurring expense's next due date and last created
    let nextDue = recurring.nextDue;
    const now = Date.now();
    
    switch (recurring.frequency) {
      case "weekly":
        nextDue = now + 7 * 24 * 60 * 60 * 1000;
        break;
      case "biweekly":
        nextDue = now + 14 * 24 * 60 * 60 * 1000;
        break;
      case "monthly":
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextDue = nextMonth.getTime();
        break;
      case "yearly":
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        nextDue = nextYear.getTime();
        break;
    }
    
    await ctx.db.patch(recurring._id, {
      nextDue,
      lastCreated: now,
    });
    
    return expenseId;
  },
});

// Get due recurring expenses (for automated processing)
export const getDueRecurringExpenses = query({
  handler: async (ctx) => {
    const now = Date.now();
    
    return await ctx.db
      .query("recurringExpenses")
      .withIndex("by_next_due", (q) => q.lte("nextDue", now))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Delete recurring expense
export const deleteRecurringExpense = mutation({
  args: {
    id: v.id("recurringExpenses"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const recurring = await ctx.db.get(args.id);
    if (!recurring || recurring.userId !== user._id) {
      throw new Error("Recurring expense not found or unauthorized");
    }
    
    await ctx.db.delete(args.id);
  },
});
