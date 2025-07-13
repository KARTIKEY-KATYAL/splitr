"use client";

import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { BarLoader } from "react-spinners";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Users,
  ChevronRight,
  TrendingUp,
  PieChart,
  Repeat,
  Camera,
  Sparkles,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { ExpenseSummary } from "./components/expense-summary";
import { BalanceSummary } from "./components/balance-summary";
import { GroupList } from "./components/group-list";

export default function Dashboard() {
  const { data: balances, isLoading: balancesLoading } = useConvexQuery(
    api.dashboard.getUserBalances
  );

  const { data: groups, isLoading: groupsLoading } = useConvexQuery(
    api.dashboard.getUserGroups
  );

  const { data: totalSpent, isLoading: totalSpentLoading } = useConvexQuery(
    api.dashboard.getTotalSpent
  );

  // Remove unused monthlySpending query
  // const { data: monthlySpending, isLoading: monthlySpendingLoading } =
  //   useConvexQuery(api.dashboard.getMonthlySpending);

  // New feature data
  const { data: budgetOverview } = useConvexQuery(api.budgets.getBudgetOverview);
  const { data: recurringExpenses } = useConvexQuery(api.recurring.getRecurringExpenses);
  const { data: smartSuggestions } = useConvexQuery(api.suggestions.getSmartSuggestions);

  // Remove unused isLoading variable
  // const isLoading =
  //   balancesLoading ||
  //   groupsLoading ||
  //   totalSpentLoading ||
  //   monthlySpendingLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="animate-slide-up-fade">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 animate-stagger-1">
          Welcome back!
        </h1>
        <p className="text-muted-foreground mt-1 animate-stagger-2">
          Here&apos;s your financial overview and recent activity
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-slide-up-fade animate-stagger-3">
        <Card className="hover-glow cursor-pointer transition-all">
          <Link href="/expenses/new">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <PlusCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Add Expense</p>
                  <p className="text-sm text-muted-foreground">
                    Create new expense
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover-glow cursor-pointer transition-all">
          <Link href="/expenses/new?tab=scanner">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Camera className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Scan Receipt</p>
                  <p className="text-sm text-muted-foreground">
                    Auto-extract data
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 text-xs"
                >
                  New
                </Badge>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover-glow cursor-pointer transition-all">
          <Link href="/analytics">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Spending insights
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 text-xs"
                >
                  New
                </Badge>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover-glow cursor-pointer transition-all">
          <Link href="/recurring">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Repeat className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Recurring</p>
                  <p className="text-sm text-muted-foreground">
                    {recurringExpenses?.length || 0} active
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 text-xs"
                >
                  New
                </Badge>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Smart Features Row */}
      <div className="grid gap-4 lg:grid-cols-3 animate-slide-up-fade animate-stagger-4">
        {/* Smart Suggestions Preview */}
        <Card className="hover-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Smart Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {smartSuggestions && smartSuggestions.length > 0 ? (
              <div className="space-y-2">
                {smartSuggestions.slice(0, 2).map((suggestion) => (
                  <div
                    key={suggestion._id}
                    className="p-2 bg-muted rounded text-sm"
                  >
                    <p className="font-medium">{suggestion.description}</p>
                    <p className="text-muted-foreground">
                      ${suggestion.avgAmount.toFixed(2)} • {suggestion.frequency}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Create more expenses to get personalized suggestions
              </p>
            )}
          </CardContent>
          <CardFooter className="pt-3">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full"
            >
              <Link href="/expenses/new">View All Suggestions</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Budget Overview Preview */}
        <Card className="hover-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Budget Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {budgetOverview && Object.keys(budgetOverview).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(budgetOverview)
                  .slice(0, 2)
                  .map(([category, data]) => (
                    <div
                      key={category}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm capitalize">{category}</span>
                      <Badge
                        variant={
                          data.status === "danger" ? "destructive" : "outline"
                        }
                        className="text-xs"
                      >
                        {data.percentage.toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Set up budgets to track your spending
              </p>
            )}
          </CardContent>
          <CardFooter className="pt-3">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full"
            >
              <Link href="/expenses/new">Manage Budgets</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recurring Expenses Preview */}
        <Card className="hover-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Repeat className="h-5 w-5 text-primary" />
              Recurring Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recurringExpenses && recurringExpenses.length > 0 ? (
              <div className="space-y-2">
                {recurringExpenses.slice(0, 2).map((expense) => {
                  const nextDue = new Date(expense.nextDue);
                  const isOverdue = nextDue < new Date();

                  return (
                    <div
                      key={expense._id}
                      className="p-2 bg-muted rounded text-sm"
                    >
                      <p className="font-medium">{expense.description}</p>
                      <p
                        className={`text-xs ${
                          isOverdue ? "text-red-600" : "text-muted-foreground"
                        }`}
                      >
                        ${expense.amount.toFixed(2)} •{" "}
                        {isOverdue ? "Overdue" : "Due soon"}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Set up recurring expenses for bills and subscriptions
              </p>
            )}
          </CardContent>
          <CardFooter className="pt-3">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full"
            >
              <Link href="/recurring">Manage Recurring</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid gap-6 lg:grid-cols-2 animate-slide-up-fade animate-stagger-5">
        {/* Balance Summary */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Balances</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/settlements">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {balancesLoading ? (
            <Card>
              <CardContent className="py-8">
                <BarLoader
                  color="#3b82f6"
                  loading={true}
                  height={4}
                  width="100%"
                />
              </CardContent>
            </Card>
          ) : (
            <BalanceSummary balances={balances} />
          )}
        </div>

        {/* Groups */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Groups</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/groups">
                <Users className="mr-2 h-4 w-4" />
                Manage Groups
              </Link>
            </Button>
          </div>
          {groupsLoading ? (
            <Card>
              <CardContent className="py-8">
                <BarLoader
                  color="#3b82f6"
                  loading={true}
                  height={4}
                  width="100%"
                />
              </CardContent>
            </Card>
          ) : (
            <GroupList groups={groups} />
          )}
        </div>
      </div>

      {/* Expense Summary */}
      <div className="animate-slide-up-fade animate-stagger-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Spending Summary</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/analytics">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </Link>
          </Button>
        </div>
        {totalSpentLoading ? (
          <Card>
            <CardContent className="py-8">
              <BarLoader
                color="#3b82f6"
                loading={true}
                height={4}
                width="100%"
              />
            </CardContent>
          </Card>
        ) : (
          <ExpenseSummary totalSpent={totalSpent} />
        )}
      </div>
    </div>
  );
}
