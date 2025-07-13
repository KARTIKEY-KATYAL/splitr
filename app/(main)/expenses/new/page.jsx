"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExpenseForm } from "./components/expense-form";
import { SmartSuggestions } from "./components/smart-suggestions";
import { ReceiptScanner } from "./components/receipt-scanner";
import { BudgetTracker } from "./components/budget-tracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, PieChart, Plus } from "lucide-react";

export default function NewExpensePage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState("form");

  const views = [
    { id: "form", label: "Create Expense", icon: Plus },
    { id: "suggestions", label: "Smart Suggestions", icon: Sparkles },
    { id: "scanner", label: "Scan Receipt", icon: Camera },
    { id: "budget", label: "Budget Tracker", icon: PieChart },
  ];

  return (
    <div className="container max-w-7xl mx-auto py-6 animate-fade-in">
      <div className="mb-6 animate-slide-up-fade">
        <h1 className="text-5xl title-red animate-stagger-1">Expense Management</h1>
        <p className="text-muted-foreground mt-1 animate-stagger-2">
          Create expenses, track spending, and manage your budget
        </p>
      </div>

      {/* View Selector */}
      <div className="mb-6 animate-slide-up-fade animate-stagger-3">
        <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <Button
                key={view.id}
                variant={activeView === view.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView(view.id)}
                className="animate-hover-lift"
              >
                <Icon className="h-4 w-4 mr-2" />
                {view.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeView === "form" && (
            <Card className="card-enhanced animate-scale-in hover-glow transition-all duration-300">
              <CardContent>
                <Tabs className="pb-3" defaultValue="individual">
                  <TabsList className="grid w-full grid-cols-2 animate-slide-up-fade animate-stagger-4">
                    <TabsTrigger value="individual" className="animate-hover-lift">Individual Expense</TabsTrigger>
                    <TabsTrigger value="group" className="animate-hover-lift">Group Expense</TabsTrigger>
                  </TabsList>
                  <TabsContent value="individual" className="mt-0 animate-fade-in animate-stagger-5">
                    <ExpenseForm
                      type="individual"
                      onSuccess={(id) => router.push(`/person/${id}`)}
                    />
                  </TabsContent>
                  <TabsContent value="group" className="mt-0 animate-fade-in animate-stagger-5">
                    <ExpenseForm
                      type="group"
                      onSuccess={(id) => router.push(`/groups/${id}`)}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {activeView === "suggestions" && (
            <div className="space-y-6">
              <SmartSuggestions
                onSuggestionSelect={(_suggestion) => {
                  // Switch to form view and pre-populate
                  setActiveView("form");
                  // The suggestion will be handled by the form component
                }}
              />
            </div>
          )}

          {activeView === "scanner" && (
            <div className="space-y-6">
              <ReceiptScanner
                onReceiptParsed={(_data) => {
                  // Switch to form view and pre-populate with receipt data
                  setActiveView("form");
                  // The receipt data will be handled by the form component
                }}
              />
            </div>
          )}

          {activeView === "budget" && (
            <div className="space-y-6">
              <BudgetTracker />
            </div>
          )}
        </div>

        {/* Sidebar - Always show suggestions and quick actions */}
        <div className="space-y-4">
          {activeView !== "suggestions" && (
            <SmartSuggestions
              onSuggestionSelect={(_suggestion) => {
                setActiveView("form");
                // The suggestion handling will be managed by form state
              }}
            />
          )}

          {activeView !== "scanner" && (
            <Card className="animate-fade-in hover-glow">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Quick Scan
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Scan a receipt to quickly create an expense
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveView("scanner")}
                  className="w-full"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Scan Receipt
                </Button>
              </CardContent>
            </Card>
          )}

          {activeView !== "budget" && (
            <Card className="animate-fade-in hover-glow">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Budget Overview
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Track your spending against budgets
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveView("budget")}
                  className="w-full"
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  View Budgets
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
