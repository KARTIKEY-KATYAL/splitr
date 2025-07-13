"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Repeat, Calendar, DollarSign, Pause, Play, Plus, Users, Trash2 } from "lucide-react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { getAllCategories, getCategoryById } from "@/lib/expense-categories";
import { toast } from "sonner";

export function RecurringExpenses() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRecurring, setNewRecurring] = useState({
    description: "",
    amount: "",
    category: "",
    frequency: "monthly",
  });

  const { data: recurringExpenses } = useConvexQuery(api.recurring.getRecurringExpenses);
  const createRecurring = useConvexMutation(api.recurring.createRecurringExpense);
  const toggleRecurring = useConvexMutation(api.recurring.toggleRecurringExpense);
  const deleteRecurring = useConvexMutation(api.recurring.deleteRecurringExpense);
  const createFromRecurring = useConvexMutation(api.recurring.createExpenseFromRecurring);

  const categories = getAllCategories();

  const getFrequencyLabel = (frequency) => {
    const labels = {
      weekly: "Weekly",
      biweekly: "Bi-weekly",
      monthly: "Monthly",
      yearly: "Yearly",
    };
    return labels[frequency] || frequency;
  };

  const getFrequencyColor = (frequency) => {
    const colors = {
      weekly: "bg-red-100 text-red-800",
      biweekly: "bg-orange-100 text-orange-800",
      monthly: "bg-green-100 text-green-800",
      yearly: "bg-blue-100 text-blue-800",
    };
    return colors[frequency] || "bg-gray-100 text-gray-800";
  };

  const handleToggle = async (id, isActive) => {
    try {
      await toggleRecurring.mutate({ id, isActive: !isActive });
      toast.success(`Recurring expense ${!isActive ? "activated" : "paused"}`);
    } catch {
      toast.error("Failed to update recurring expense");
    }
  };

  const handleDelete = async (id, description) => {
    if (!window.confirm(`Delete recurring expense "${description}"?`)) return;

    try {
      await deleteRecurring.mutate({ id });
      toast.success("Recurring expense deleted");
    } catch {
      toast.error("Failed to delete recurring expense");
    }
  };

  const handleCreateExpense = async (recurringId, description) => {
    try {
      await createFromRecurring.mutate({ recurringId });
      toast.success(`Created expense from "${description}"`);
    } catch {
      toast.error("Failed to create expense");
    }
  };

  const handleCreate = async () => {
    if (!newRecurring.description || !newRecurring.amount || !newRecurring.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const amount = parseFloat(newRecurring.amount);
      
      // For now, create with just the current user as participant
      // In a real app, you'd have a participant selector
      await createRecurring.mutate({
        description: newRecurring.description,
        amount,
        category: newRecurring.category,
        frequency: newRecurring.frequency,
        participants: [], // Will be filled by the mutation
        splitType: "equal",
        splits: [], // Will be calculated by the mutation
      });

      toast.success("Recurring expense created");
      setNewRecurring({ description: "", amount: "", category: "", frequency: "monthly" });
      setIsCreateDialogOpen(false);
    } catch {
      toast.error("Failed to create recurring expense");
    }
  };

  const formatNextDue = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  if (!recurringExpenses) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-8 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading recurring expenses...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Repeat className="h-6 w-6" />
          Recurring Expenses
        </h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="animate-hover-lift">
              <Plus className="h-4 w-4 mr-2" />
              Add Recurring
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Recurring Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newRecurring.description}
                  onChange={(e) => setNewRecurring({ ...newRecurring, description: e.target.value })}
                  placeholder="e.g., Monthly internet bill"
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newRecurring.amount}
                  onChange={(e) => setNewRecurring({ ...newRecurring, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newRecurring.category}
                  onValueChange={(value) => setNewRecurring({ ...newRecurring, category: value })}
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
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={newRecurring.frequency}
                  onValueChange={(value) => setNewRecurring({ ...newRecurring, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Recurring Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {recurringExpenses.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="py-8 text-center">
            <Repeat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Recurring Expenses</h3>
            <p className="text-muted-foreground mb-4">
              Set up recurring expenses like bills, subscriptions, and regular payments
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Recurring Expense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recurringExpenses.map((expense, index) => {
            const category = getCategoryById(expense.category);
            const CategoryIcon = category.icon;
            const nextDueText = formatNextDue(expense.nextDue);
            const isOverdue = expense.nextDue < Date.now();

            return (
              <Card key={expense._id} className={`animate-scale-in animate-stagger-${index + 1} hover-glow relative`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="bg-primary/10 p-1.5 rounded">
                        <CategoryIcon className="h-4 w-4 text-primary" />
                      </div>
                      <CardTitle className="text-base truncate">{expense.description}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={expense.isActive}
                        onCheckedChange={() => handleToggle(expense._id, expense.isActive)}
                        size="sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense._id, expense.description)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">${expense.amount.toFixed(2)}</span>
                    </div>
                    <Badge className={`text-xs ${getFrequencyColor(expense.frequency)}`}>
                      {getFrequencyLabel(expense.frequency)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className={isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}>
                      Next: {nextDueText}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {expense.isActive ? (
                        <Badge variant="default" className="text-xs">
                          <Play className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <Pause className="h-3 w-3 mr-1" />
                          Paused
                        </Badge>
                      )}
                      {expense.participants.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {expense.participants.length}
                        </Badge>
                      )}
                    </div>
                    
                    {expense.isActive && (
                      <Button
                        size="sm"
                        variant={isOverdue ? "default" : "outline"}
                        onClick={() => handleCreateExpense(expense._id, expense.description)}
                        className="h-7 text-xs"
                      >
                        {isOverdue ? "Pay Now" : "Create Expense"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
