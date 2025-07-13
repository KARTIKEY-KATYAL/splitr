"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, AlertTriangle, TrendingUp, Plus, Edit } from "lucide-react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { getAllCategories } from "@/lib/expense-categories";
import { toast } from "sonner";

export function BudgetTracker() {
  const [editingBudget, setEditingBudget] = useState(null);
  const [newBudget, setNewBudget] = useState({ category: "", amount: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: budgetOverview } = useConvexQuery(api.budgets.getBudgetOverview);
  const setBudget = useConvexMutation(api.budgets.setBudget);

  const categories = getAllCategories();

  const getBudgetStatus = (status) => {
    switch (status) {
      case "danger":
        return { color: "bg-red-500", textColor: "text-red-600", bgColor: "bg-red-50" };
      case "warning":
        return { color: "bg-yellow-500", textColor: "text-yellow-600", bgColor: "bg-yellow-50" };
      case "good":
        return { color: "bg-green-500", textColor: "text-green-600", bgColor: "bg-green-50" };
      default:
        return { color: "bg-gray-500", textColor: "text-gray-600", bgColor: "bg-gray-50" };
    }
  };

  const handleSetBudget = async () => {
    if (!newBudget.category || !newBudget.amount) {
      toast.error("Please select a category and enter an amount");
      return;
    }

    try {
      await setBudget.mutate({
        category: newBudget.category,
        monthlyLimit: parseFloat(newBudget.amount),
      });
      toast.success("Budget updated successfully");
      setNewBudget({ category: "", amount: "" });
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update budget");
    }
  };

  if (!budgetOverview) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-8 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading budget data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <PieChart className="h-6 w-6" />
          Budget Tracker
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="animate-hover-lift">
              <Plus className="h-4 w-4 mr-2" />
              Set Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Category Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newBudget.category}
                  onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Monthly Budget ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                  placeholder="Enter monthly budget"
                />
              </div>
              <Button onClick={handleSetBudget} className="w-full">
                Set Budget
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(budgetOverview).map(([category, data], index) => {
          const { color, textColor, bgColor } = getBudgetStatus(data.status);
          const categoryInfo = categories.find(c => c.id === category) || { name: category };

          return (
            <Card key={category} className={`animate-scale-in animate-stagger-${index + 1} hover-glow ${bgColor}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{categoryInfo.name}</span>
                  {data.status === "danger" && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  {data.status === "no-budget" && (
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">No Budget</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">${data.spent.toFixed(2)}</span>
                  <span className="text-muted-foreground">
                    {data.budget > 0 ? `of $${data.budget.toFixed(2)}` : "No limit"}
                  </span>
                </div>
                
                {data.budget > 0 && (
                  <>
                    <Progress 
                      value={Math.min(data.percentage, 100)} 
                      className={`h-2`}
                    />
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${textColor}`}>
                        {data.percentage.toFixed(1)}% used
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ${data.remaining.toFixed(2)} left
                      </span>
                    </div>
                  </>
                )}

                {data.status !== "no-budget" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNewBudget({ category, amount: data.budget.toString() });
                      setIsDialogOpen(true);
                    }}
                    className="w-full mt-2"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit Budget
                  </Button>
                )}

                {data.status === "no-budget" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewBudget({ category, amount: "" });
                      setIsDialogOpen(true);
                    }}
                    className="w-full mt-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Set Budget
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {Object.keys(budgetOverview).length === 0 && (
        <Card className="animate-fade-in">
          <CardContent className="py-8 text-center">
            <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Budget Data</h3>
            <p className="text-muted-foreground mb-4">
              Set budgets for different categories to track your spending
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
