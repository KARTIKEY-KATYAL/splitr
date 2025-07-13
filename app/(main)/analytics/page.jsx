"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, BarChart3, PieChart, DollarSign, Target } from "lucide-react";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";

export function ExpenseAnalytics() {
  const [timeRange, setTimeRange] = useState("month");

  const { data: analytics } = useConvexQuery(api.analytics.getExpenseAnalytics, {
    timeRange,
  });
  const { data: trends } = useConvexQuery(api.analytics.getSpendingTrends, {
    timeRange,
    groupBy: timeRange === "week" ? "day" : timeRange === "month" ? "week" : "month",
  });

  const getTrendIcon = (trend) => {
    return trend > 0 ? (
      <TrendingUp className="h-4 w-4 text-red-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-green-500" />
    );
  };

  const getTrendColor = (trend) => {
    return trend > 0 ? "text-red-600" : "text-green-600";
  };

  const formatPeriod = (timestamp, groupBy) => {
    const date = new Date(timestamp);
    switch (groupBy) {
      case "day":
        return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      case "week":
        return `Week ${Math.ceil(date.getDate() / 7)}`;
      case "month":
        return date.toLocaleDateString(undefined, { month: 'short' });
      default:
        return date.toLocaleDateString();
    }
  };

  if (!analytics) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-8 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Expense Analytics
        </h2>
        <div className="flex gap-2">
          {["week", "month", "year"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="animate-hover-lift"
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-scale-in hover-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.totalSpent?.toFixed(2) || "0.00"}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {getTrendIcon(analytics.spentTrend || 0)}
              <span className={getTrendColor(analytics.spentTrend || 0)}>
                {Math.abs(analytics.spentTrend || 0).toFixed(1)}% vs last {timeRange}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-scale-in animate-stagger-2 hover-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Avg Per Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.avgExpense?.toFixed(2) || "0.00"}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {getTrendIcon(analytics.avgTrend || 0)}
              <span className={getTrendColor(analytics.avgTrend || 0)}>
                {Math.abs(analytics.avgTrend || 0).toFixed(1)}% vs last {timeRange}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-scale-in animate-stagger-3 hover-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4 text-purple-600" />
              Top Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {analytics.topCategory?.name || "None"}
            </div>
            <div className="text-sm text-muted-foreground">
              ${analytics.topCategory?.amount?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-scale-in animate-stagger-4 hover-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              Budget Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {analytics.budgetStatus === "under" ? "+" : "-"}$
              {Math.abs(analytics.budgetDiff || 0).toFixed(2)}
            </div>
            <Badge
              variant={analytics.budgetStatus === "under" ? "default" : "destructive"}
              className="text-xs"
            >
              {analytics.budgetStatus === "under" ? "Under Budget" : "Over Budget"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="animate-fade-in animate-stagger-5 hover-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.categoryBreakdown?.length > 0 ? (
            <div className="space-y-4">
              {analytics.categoryBreakdown.map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full animate-pulse animate-stagger-${index + 1}`}
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {category.percentage.toFixed(1)}%
                      </span>
                      <span className="font-medium">${category.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <Progress 
                    value={category.percentage} 
                    className="h-2" 
                    style={{ 
                      backgroundColor: `${category.color}20`,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <PieChart className="h-8 w-8 mx-auto mb-2" />
              <p>No expense data available for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending Trends */}
      {trends && trends.length > 0 && (
        <Card className="animate-fade-in animate-stagger-6 hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Spending Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trends.map((period) => {
                const maxSpent = Math.max(...trends.map(p => p.totalSpent));
                const percentage = maxSpent > 0 ? (period.totalSpent / maxSpent) * 100 : 0;

                return (
                  <div key={period.period} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatPeriod(period.period, timeRange === "week" ? "day" : timeRange === "month" ? "week" : "month")}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${period.totalSpent.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">
                          ({period.expenseCount} expenses)
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Insights */}
      <Card className="animate-fade-in animate-stagger-7 hover-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">Spending Pattern</h4>
              <p className="text-sm text-blue-700">
                {analytics.spentTrend > 0 
                  ? `You're spending ${analytics.spentTrend.toFixed(1)}% more than last ${timeRange}`
                  : `You're spending ${Math.abs(analytics.spentTrend).toFixed(1)}% less than last ${timeRange}`
                }
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-1">Top Category</h4>
              <p className="text-sm text-green-700">
                {analytics.topCategory 
                  ? `Most spent on ${analytics.topCategory.name}: $${analytics.topCategory.amount.toFixed(2)}`
                  : "No category data available"
                }
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-1">Average Expense</h4>
              <p className="text-sm text-purple-700">
                Your average expense is ${analytics.avgExpense.toFixed(2)} this {timeRange}
              </p>
            </div>
            
            <div className="p-3 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-1">Budget Performance</h4>
              <p className="text-sm text-orange-700">
                {analytics.budgetStatus === "under" 
                  ? `You're under budget by $${analytics.budgetDiff?.toFixed(2) || "0.00"}`
                  : `You're over budget by $${Math.abs(analytics.budgetDiff || 0).toFixed(2)}`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
