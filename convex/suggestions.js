import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Generate smart expense suggestions based on user patterns
export const generateSmartSuggestions = mutation({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    // Get user's expenses from last 3 months
    const threeMonthsAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    
    const recentExpenses = await ctx.db
      .query("expenses")
      .withIndex("by_date", (q) => q.gte("date", threeMonthsAgo))
      .filter((q) => q.eq(q.field("paidByUserId"), user._id))
      .collect();
    
    // Group expenses by description similarity and category
    const expensePatterns = {};
    
    recentExpenses.forEach((expense) => {
      const key = `${expense.category}-${expense.description.toLowerCase().trim()}`;
      
      if (!expensePatterns[key]) {
        expensePatterns[key] = {
          description: expense.description,
          category: expense.category,
          amounts: [],
          dates: [],
          expenseIds: [],
        };
      }
      
      expensePatterns[key].amounts.push(expense.amount);
      expensePatterns[key].dates.push(expense.date);
      expensePatterns[key].expenseIds.push(expense._id);
    });
    
    // Clear existing suggestions for this user
    const existingSuggestions = await ctx.db
      .query("expenseSuggestions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    for (const suggestion of existingSuggestions) {
      await ctx.db.delete(suggestion._id);
    }
    
    // Generate new suggestions
    const suggestions = [];
    
    Object.entries(expensePatterns).forEach(([key, pattern]) => {
      // Need at least 2 occurrences to be a pattern
      if (pattern.amounts.length < 2) return;
      
      const avgAmount = pattern.amounts.reduce((sum, amt) => sum + amt, 0) / pattern.amounts.length;
      
      // Calculate frequency
      const sortedDates = pattern.dates.sort((a, b) => a - b);
      const intervals = [];
      for (let i = 1; i < sortedDates.length; i++) {
        intervals.push(sortedDates[i] - sortedDates[i - 1]);
      }
      
      const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      const daysBetween = avgInterval / (24 * 60 * 60 * 1000);
      
      let frequency = "irregular";
      if (daysBetween <= 2) frequency = "daily";
      else if (daysBetween <= 8) frequency = "weekly";
      else if (daysBetween <= 35) frequency = "monthly";
      
      // Calculate confidence based on consistency
      const amountVariance = pattern.amounts.reduce((sum, amt) => sum + Math.pow(amt - avgAmount, 2), 0) / pattern.amounts.length;
      const coefficientOfVariation = Math.sqrt(amountVariance) / avgAmount;
      const confidence = Math.max(0, Math.min(1, 1 - coefficientOfVariation));
      
      suggestions.push({
        userId: user._id,
        description: pattern.description,
        category: pattern.category,
        avgAmount,
        frequency,
        lastSuggested: Date.now(),
        confidence,
        basedOnExpenses: pattern.expenseIds,
        isActive: true,
      });
    });
    
    // Insert new suggestions (top 10 by confidence)
    const topSuggestions = suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
    
    for (const suggestion of topSuggestions) {
      await ctx.db.insert("expenseSuggestions", suggestion);
    }
    
    return topSuggestions.length;
  },
});

// Get smart suggestions for user
export const getSmartSuggestions = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const suggestions = await ctx.db
      .query("expenseSuggestions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);
    
    return suggestions.slice(0, 5); // Return top 5
  },
});

// Use a suggestion to create an expense
export const useSuggestion = mutation({
  args: {
    suggestionId: v.id("expenseSuggestions"),
    amount: v.optional(v.number()),
    participants: v.array(v.id("users")),
    groupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const suggestion = await ctx.db.get(args.suggestionId);
    if (!suggestion || suggestion.userId !== user._id) {
      throw new Error("Suggestion not found or unauthorized");
    }
    
    const amount = args.amount || suggestion.avgAmount;
    
    // Create splits for participants
    const shareAmount = amount / args.participants.length;
    const splits = args.participants.map(participantId => ({
      userId: participantId,
      amount: shareAmount,
      paid: participantId === user._id,
    }));
    
    // Create the expense
    const expenseId = await ctx.runAction(internal.expenses.createExpense, {
      description: suggestion.description,
      amount,
      category: suggestion.category,
      date: Date.now(),
      paidByUserId: user._id,
      splitType: "equal",
      splits,
      groupId: args.groupId,
    });
    
    // Update suggestion last used time
    await ctx.db.patch(suggestion._id, {
      lastSuggested: Date.now(),
    });
    
    return expenseId;
  },
});

// Dismiss a suggestion
export const dismissSuggestion = mutation({
  args: {
    suggestionId: v.id("expenseSuggestions"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const suggestion = await ctx.db.get(args.suggestionId);
    if (!suggestion || suggestion.userId !== user._id) {
      throw new Error("Suggestion not found or unauthorized");
    }
    
    await ctx.db.patch(suggestion._id, {
      isActive: false,
    });
  },
});
