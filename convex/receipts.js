import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Parse receipt using OCR (mock implementation - replace with actual OCR service)
export const parseReceipt = action({
  args: {
    image: v.string(), // base64 encoded image
    filename: v.string(),
  },
  handler: async (ctx, args) => {
    // This is a mock implementation. In production, you would:
    // 1. Upload image to cloud storage (Cloudinary, AWS S3, etc.)
    // 2. Send to OCR service (Google Vision API, AWS Textract, etc.)
    // 3. Parse the OCR results to extract relevant information
    
    try {
      // Mock OCR result - replace with actual OCR service call
      const mockOcrResult = {
        extractedText: "RESTAURANT ABC\n123 Main St\nBurger & Fries $12.50\nDrink $2.50\nTax $1.50\nTotal: $16.50\nThank you!",
        confidence: 0.85,
        merchantName: "Restaurant ABC",
        extractedAmount: 16.50,
        items: [
          { description: "Burger & Fries", amount: 12.50 },
          { description: "Drink", amount: 2.50 },
        ],
        tax: 1.50,
        total: 16.50,
      };
      
      // In production, you would also upload the image and get a URL
      const imageUrl = `https://example.com/receipts/${args.filename}`;
      
      return {
        success: true,
        data: {
          imageUrl,
          receiptData: mockOcrResult,
          suggestedExpense: {
            description: `Expense at ${mockOcrResult.merchantName}`,
            amount: mockOcrResult.extractedAmount,
            category: determineCategoryFromMerchant(mockOcrResult.merchantName),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

// Helper function to determine category from merchant name
function determineCategoryFromMerchant(merchantName) {
  const lowerName = merchantName.toLowerCase();
  
  if (lowerName.includes("restaurant") || lowerName.includes("cafe") || lowerName.includes("food")) {
    return "foodDrink";
  }
  if (lowerName.includes("gas") || lowerName.includes("fuel") || lowerName.includes("station")) {
    return "transportation";
  }
  if (lowerName.includes("grocery") || lowerName.includes("market")) {
    return "groceries";
  }
  if (lowerName.includes("pharmacy") || lowerName.includes("medical")) {
    return "health";
  }
  if (lowerName.includes("hotel") || lowerName.includes("motel")) {
    return "travel";
  }
  
  return "other";
}

// Save receipt data with expense
export const saveReceiptWithExpense = mutation({
  args: {
    expenseId: v.id("expenses"),
    receiptImageUrl: v.string(),
    receiptData: v.object({
      extractedText: v.optional(v.string()),
      confidence: v.optional(v.number()),
      merchantName: v.optional(v.string()),
      extractedAmount: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const expense = await ctx.db.get(args.expenseId);
    if (!expense || expense.createdBy !== user._id) {
      throw new Error("Expense not found or unauthorized");
    }
    
    await ctx.db.patch(args.expenseId, {
      receiptImageUrl: args.receiptImageUrl,
      receiptData: args.receiptData,
    });
    
    return { success: true };
  },
});

// Get expenses with receipts
export const getExpensesWithReceipts = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const expenses = await ctx.db
      .query("expenses")
      .filter((q) => 
        q.and(
          q.neq(q.field("receiptImageUrl"), undefined),
          q.or(
            q.eq(q.field("paidByUserId"), user._id),
            q.eq(q.field("createdBy"), user._id)
          )
        )
      )
      .collect();
    
    return expenses.sort((a, b) => b.date - a.date);
  },
});

// Analyze receipt data for insights
export const analyzeReceiptData = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    const expensesWithReceipts = await ctx.db
      .query("expenses")
      .filter((q) => 
        q.and(
          q.neq(q.field("receiptImageUrl"), undefined),
          q.eq(q.field("paidByUserId"), user._id)
        )
      )
      .collect();
    
    const analysis = {
      totalReceiptsScanned: expensesWithReceipts.length,
      averageConfidence: 0,
      topMerchants: {},
      categorySuggestionAccuracy: 0,
    };
    
    if (expensesWithReceipts.length > 0) {
      // Calculate average OCR confidence
      const totalConfidence = expensesWithReceipts.reduce((sum, expense) => {
        return sum + (expense.receiptData?.confidence || 0);
      }, 0);
      analysis.averageConfidence = totalConfidence / expensesWithReceipts.length;
      
      // Count top merchants
      expensesWithReceipts.forEach((expense) => {
        const merchant = expense.receiptData?.merchantName;
        if (merchant) {
          analysis.topMerchants[merchant] = (analysis.topMerchants[merchant] || 0) + 1;
        }
      });
      
      // Calculate category suggestion accuracy (mock calculation)
      analysis.categorySuggestionAccuracy = 0.75; // 75% accuracy mock
    }
    
    return analysis;
  },
});
