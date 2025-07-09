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
import { PlusCircle, Users, ChevronRight } from "lucide-react";
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

  const { data: monthlySpending, isLoading: monthlySpendingLoading } =
    useConvexQuery(api.dashboard.getMonthlySpending);

  const isLoading =
    balancesLoading ||
    groupsLoading ||
    totalSpentLoading ||
    monthlySpendingLoading;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {isLoading ? (
        <div className="w-full py-12 flex justify-center animate-pulse">
          <div className="space-y-4 w-full max-w-md">
            <div className="animate-loading-pulse">
              <BarLoader width={"100%"} color="hsl(var(--accent))" />
            </div>
            <div className="text-center text-theme-muted animate-typewriter">
              Loading your dashboard...
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="flex justify-between flex-col sm:flex-row sm:items-center gap-4 animate-slide-up-fade">
            <div className="animate-fade-in animate-delay-100">
              <h1 className="text-5xl title-black animate-typewriter">Dashboard</h1>
              <p className="text-muted-foreground mt-2 animate-slide-up animate-delay-200">
                Track your expenses and manage your finances
              </p>
            </div>
            <div className="flex gap-2 animate-slide-left animate-delay-300">
              <Button asChild className="btn-red animate-hover-lift hover-glow magnetic-button">
                <Link href="/expenses/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add expense
                </Link>
              </Button>
              <Button asChild className="btn-blue-outline animate-hover-lift animate-hover-scale">
                <Link href="/contacts?createGroup=true">
                  <Users className="h-4 w-4 mr-2" />
                  Create Group
                </Link>
              </Button>
            </div>
          </div>

          {/* Balance overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up-fade animate-stagger-1">
            <Card className="card-enhanced animate-hover-lift card-stack animate-scale-in animate-stagger-1 hover-glow transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground animate-fade-in animate-stagger-2">
                  Total Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold animate-fade-in animate-stagger-3">
                  {balances?.totalBalance > 0 ? (
                    <span className="text-positive animate-bounce-in-up animate-stagger-4">
                      +${balances?.totalBalance.toFixed(2)}
                    </span>
                  ) : balances?.totalBalance < 0 ? (
                    <span className="text-negative animate-shake animate-stagger-4">
                      -${Math.abs(balances?.totalBalance).toFixed(2)}
                    </span>
                  ) : (
                    <span className="animate-pulsing">$0.00</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 animate-fade-in animate-stagger-5">
                  {balances?.totalBalance > 0
                    ? "You are owed money"
                    : balances?.totalBalance < 0
                      ? "You owe money"
                      : "All settled up!"}
                </p>
              </CardContent>
            </Card>

            <Card className="card-enhanced animate-hover-lift card-stack animate-scale-in animate-stagger-2 hover-glow transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground animate-fade-in animate-stagger-3">
                  You are owed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-positive animate-fade-in animate-stagger-4">
                  ${balances?.youAreOwed.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 animate-fade-in animate-stagger-5">
                  From {balances?.oweDetails?.youAreOwedBy?.length || 0} people
                </p>
              </CardContent>
            </Card>

            <Card className="card-enhanced animate-hover-lift card-stack animate-scale-in animate-stagger-3 hover-glow transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground animate-fade-in animate-stagger-4">
                  You owe
                </CardTitle>
              </CardHeader>
              <CardContent>
                {balances?.oweDetails?.youOwe?.length > 0 ? (
                  <>
                    <div className="text-2xl font-bold text-negative animate-fade-in animate-stagger-5">
                      ${balances?.youOwe.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 animate-fade-in animate-stagger-6">
                      To {balances?.oweDetails?.youOwe?.length || 0} people
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold animate-fade-in animate-stagger-5">$0.00</div>
                    <p className="text-xs text-muted-foreground mt-1 animate-fade-in animate-stagger-6">
                      You don&apos;t owe anyone
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main dashboard content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up-fade animate-stagger-3">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Expense summary */}
              <div className="animate-scale-in animate-stagger-4">
                <ExpenseSummary
                  monthlySpending={monthlySpending}
                  totalSpent={totalSpent}
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6 animate-slide-in-right animate-stagger-5">
              {/* Balance details */}
              <Card className="card-enhanced animate-hover-lift hover-glow transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="animate-fade-in animate-stagger-6">Balance Details</CardTitle>
                    <Button variant="link" asChild className="p-0 animate-hover-scale">
                      <Link href="/contacts">
                        View all
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="animate-fade-in animate-stagger-7">
                    <BalanceSummary balances={balances} />
                  </div>
                </CardContent>
              </Card>

              {/* Groups */}
              <Card className="card-enhanced animate-hover-lift hover-glow transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="animate-fade-in animate-stagger-8">Your Groups</CardTitle>
                    <Button variant="link" asChild className="p-0 animate-hover-scale">
                      <Link href="/contacts">
                        View all
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="animate-fade-in animate-stagger-9">
                    <GroupList groups={groups} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild className="w-full animate-hover-lift magnetic-button">
                    <Link href="/contacts?createGroup=true">
                      <Users className="mr-2 h-4 w-4" />
                      Create new group
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
