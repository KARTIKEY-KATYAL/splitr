import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Get user budgets for current month
export const getUserBudgets = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Get budgets for current month
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", user._id).eq("year", currentYear).eq("month", currentMonth)
      )
      .collect();
    
    return budgets;
  },
});

// Set budget for a category
export const setBudget = mutation({
  args: {
    category: v.string(),
    monthlyLimit: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Check if budget exists for this category and month
    const existingBudget = await ctx.db
      .query("budgets")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", user._id).eq("year", currentYear).eq("month", currentMonth)
      )
      .filter((q) => q.eq(q.field("category"), args.category))
      .first();
    
    if (existingBudget) {
      // Update existing budget
      await ctx.db.patch(existingBudget._id, {
        monthlyLimit: args.monthlyLimit,
        lastUpdated: Date.now(),
      });
      return existingBudget._id;
    } else {
      // Create new budget
      return await ctx.db.insert("budgets", {
        userId: user._id,
        category: args.category,
        monthlyLimit: args.monthlyLimit,
        year: currentYear,
        month: currentMonth,
        spent: 0,
        lastUpdated: Date.now(),
      });
    }
  },
});

// Get monthly expenses by category for budget tracking
export const getMonthlyExpensesByCategory = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
    
    // Get all expenses for current month
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_date", (q) => q.gte("date", startOfMonth))
      .filter((q) => q.lte(q.field("date"), endOfMonth))
      .collect();
    
    // Filter for expenses where user is involved
    const userExpenses = expenses.filter(
      (expense) =>
        expense.paidByUserId === user._id ||
        expense.splits.some((split) => split.userId === user._id)
    );
    
    // Group by category and sum user's share
    const categoryTotals = {};
    
    userExpenses.forEach((expense) => {
      const category = expense.category || "other";
      const userSplit = expense.splits.find(
        (split) => split.userId === user._id
      );
      
      if (userSplit) {
        categoryTotals[category] = (categoryTotals[category] || 0) + userSplit.amount;
      }
    });
    
    return categoryTotals;
  },
});

// Update budget spent amounts (called when expenses are created)
export const updateBudgetSpent = mutation({
  args: {
    category: v.string(),
    amount: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Find budget for this category and month
    const budget = await ctx.db
      .query("budgets")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", args.userId).eq("year", currentYear).eq("month", currentMonth)
      )
      .filter((q) => q.eq(q.field("category"), args.category))
      .first();
    
    if (budget) {
      // Update spent amount
      await ctx.db.patch(budget._id, {
        spent: budget.spent + args.amount,
        lastUpdated: Date.now(),
      });
    }
  },
});

// Get budget overview with status
export const getBudgetOverview = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const budgets = await ctx.runQuery(internal.budgets.getUserBudgets);
    const monthlyExpenses = await ctx.runQuery(internal.budgets.getMonthlyExpensesByCategory);
    
    const budgetOverview = {};
    
    // Process budgets
    budgets.forEach((budget) => {
      const spent = monthlyExpenses[budget.category] || 0;
      const percentage = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;
      
      budgetOverview[budget.category] = {
        budget: budget.monthlyLimit,
        spent,
        percentage,
        remaining: Math.max(0, budget.monthlyLimit - spent),
        status: percentage >= 90 ? "danger" : percentage >= 70 ? "warning" : "good",
      };
    });
    
    // Add categories with expenses but no budget
    Object.keys(monthlyExpenses).forEach((category) => {
      if (!budgetOverview[category]) {
        budgetOverview[category] = {
          budget: 0,
          spent: monthlyExpenses[category],
          percentage: 0,
          remaining: 0,
          status: "no-budget",
        };
      }
    });
    
    return budgetOverview;
  },
});
