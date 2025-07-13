import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Get comprehensive expense analytics
export const getExpenseAnalytics = query({
  args: {
    timeRange: v.string(), // "week", "month", "year"
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    // Check if we have cached data that's recent enough
    const cached = await ctx.db
      .query("analyticsCache")
      .withIndex("by_user_range", (q) =>
        q.eq("userId", user._id).eq("timeRange", args.timeRange)
      )
      .first();
    
    const cacheAge = 15 * 60 * 1000; // 15 minutes
    if (cached && Date.now() - cached.lastUpdated < cacheAge) {
      return cached.data;
    }
    
    // Calculate date range
    const now = Date.now();
    let startDate = now;
    let previousStartDate = now;
    
    switch (args.timeRange) {
      case "week":
        startDate = now - (7 * 24 * 60 * 60 * 1000);
        previousStartDate = now - (14 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        const currentMonth = new Date();
        startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getTime();
        previousStartDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1).getTime();
        break;
      case "year":
        const currentYear = new Date();
        startDate = new Date(currentYear.getFullYear(), 0, 1).getTime();
        previousStartDate = new Date(currentYear.getFullYear() - 1, 0, 1).getTime();
        break;
    }
    
    // Get expenses for current and previous periods
    const [currentExpenses, previousExpenses] = await Promise.all([
      ctx.db
        .query("expenses")
        .withIndex("by_date", (q) => q.gte("date", startDate))
        .collect(),
      ctx.db
        .query("expenses")
        .withIndex("by_date", (q) => 
          q.gte("date", previousStartDate).lt("date", startDate)
        )
        .collect(),
    ]);
    
    // Filter for user's expenses
    const userCurrentExpenses = currentExpenses.filter(
      (expense) =>
        expense.paidByUserId === user._id ||
        expense.splits.some((split) => split.userId === user._id)
    );
    
    const userPreviousExpenses = previousExpenses.filter(
      (expense) =>
        expense.paidByUserId === user._id ||
        expense.splits.some((split) => split.userId === user._id)
    );
    
    // Calculate analytics
    const analytics = await calculateAnalytics(
      userCurrentExpenses,
      userPreviousExpenses,
      user._id
    );
    
    // Cache the results
    if (cached) {
      await ctx.db.patch(cached._id, {
        data: analytics,
        lastUpdated: now,
      });
    } else {
      await ctx.db.insert("analyticsCache", {
        userId: user._id,
        timeRange: args.timeRange,
        data: analytics,
        lastUpdated: now,
      });
    }
    
    return analytics;
  },
});

// Calculate detailed analytics
async function calculateAnalytics(currentExpenses, previousExpenses, userId) {
  // Calculate total spent (user's share only)
  const calculateUserSpent = (expenses) => {
    return expenses.reduce((total, expense) => {
      const userSplit = expense.splits.find(split => split.userId === userId);
      return total + (userSplit ? userSplit.amount : 0);
    }, 0);
  };
  
  const totalSpent = calculateUserSpent(currentExpenses);
  const previousTotalSpent = calculateUserSpent(previousExpenses);
  
  // Calculate average expense
  const avgExpense = currentExpenses.length > 0 ? totalSpent / currentExpenses.length : 0;
  const previousAvgExpense = previousExpenses.length > 0 ? previousTotalSpent / previousExpenses.length : 0;
  
  // Calculate trends
  const spentTrend = previousTotalSpent > 0 
    ? ((totalSpent - previousTotalSpent) / previousTotalSpent) * 100 
    : 0;
  const avgTrend = previousAvgExpense > 0 
    ? ((avgExpense - previousAvgExpense) / previousAvgExpense) * 100 
    : 0;
  
  // Category breakdown
  const categoryTotals = {};
  currentExpenses.forEach((expense) => {
    const category = expense.category || "other";
    const userSplit = expense.splits.find(split => split.userId === userId);
    if (userSplit) {
      categoryTotals[category] = (categoryTotals[category] || 0) + userSplit.amount;
    }
  });
  
  // Sort categories by amount and create breakdown
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a);
  
  const topCategory = sortedCategories.length > 0 
    ? { name: sortedCategories[0][0], amount: sortedCategories[0][1] }
    : null;
  
  // Generate colors for categories
  const colors = [
    "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#3B82F6",
    "#EC4899", "#84CC16", "#F97316", "#6366F1", "#14B8A6"
  ];
  
  const categoryBreakdown = sortedCategories.map(([name, amount], index) => ({
    name,
    amount,
    percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
    color: colors[index % colors.length],
  }));
  
  return {
    totalSpent,
    avgExpense,
    topCategory,
    categoryBreakdown,
    spentTrend,
    avgTrend,
    budgetStatus: "under", // This would come from budget comparison
    budgetDiff: 0, // This would be calculated from budget data
  };
}

// Get spending trends over time
export const getSpendingTrends = query({
  args: {
    timeRange: v.string(),
    groupBy: v.string(), // "day", "week", "month"
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    // Calculate date range
    const now = Date.now();
    let startDate = now;
    let periods = [];
    
    switch (args.timeRange) {
      case "week":
        startDate = now - (7 * 24 * 60 * 60 * 1000);
        if (args.groupBy === "day") {
          for (let i = 6; i >= 0; i--) {
            periods.push(now - (i * 24 * 60 * 60 * 1000));
          }
        }
        break;
      case "month":
        const currentMonth = new Date();
        startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getTime();
        if (args.groupBy === "week") {
          for (let i = 0; i < 4; i++) {
            periods.push(startDate + (i * 7 * 24 * 60 * 60 * 1000));
          }
        }
        break;
      case "year":
        const currentYear = new Date();
        startDate = new Date(currentYear.getFullYear(), 0, 1).getTime();
        if (args.groupBy === "month") {
          for (let i = 0; i < 12; i++) {
            periods.push(new Date(currentYear.getFullYear(), i, 1).getTime());
          }
        }
        break;
    }
    
    // Get expenses for the period
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_date", (q) => q.gte("date", startDate))
      .collect();
    
    // Filter for user's expenses
    const userExpenses = expenses.filter(
      (expense) =>
        expense.paidByUserId === user._id ||
        expense.splits.some((split) => split.userId === user._id)
    );
    
    // Group expenses by periods
    const trendData = periods.map((periodStart) => {
      const periodEnd = getPeriodEnd(periodStart, args.groupBy);
      
      const periodExpenses = userExpenses.filter(
        (expense) => expense.date >= periodStart && expense.date < periodEnd
      );
      
      const totalSpent = periodExpenses.reduce((total, expense) => {
        const userSplit = expense.splits.find(split => split.userId === user._id);
        return total + (userSplit ? userSplit.amount : 0);
      }, 0);
      
      return {
        period: periodStart,
        totalSpent,
        expenseCount: periodExpenses.length,
      };
    });
    
    return trendData;
  },
});

// Helper function to get period end
function getPeriodEnd(periodStart, groupBy) {
  const start = new Date(periodStart);
  
  switch (groupBy) {
    case "day":
      return start.getTime() + (24 * 60 * 60 * 1000);
    case "week":
      return start.getTime() + (7 * 24 * 60 * 60 * 1000);
    case "month":
      const nextMonth = new Date(start);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth.getTime();
    default:
      return periodStart + (24 * 60 * 60 * 1000);
  }
}

// Clear analytics cache (useful for development/testing)
export const clearAnalyticsCache = mutation({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const cacheEntries = await ctx.db
      .query("analyticsCache")
      .withIndex("by_user_range", (q) => q.eq("userId", user._id))
      .collect();
    
    for (const entry of cacheEntries) {
      await ctx.db.delete(entry._id);
    }
    
    return cacheEntries.length;
  },
});
