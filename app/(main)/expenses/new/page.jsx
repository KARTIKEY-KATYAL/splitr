"use client";

import { useRouter } from "next/navigation";
import { ExpenseForm } from "./components/expense-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function NewExpensePage() {
  const router = useRouter();

  return (
    <div className="container max-w-3xl mx-auto py-6 animate-fade-in">
      <div className="mb-6 animate-slide-up-fade">
        <h1 className="text-5xl title-red animate-stagger-1">Add a new expense</h1>
        <p className="text-muted-foreground mt-1 animate-stagger-2">
          Record a new expense to split with others
        </p>
      </div>

      <Card className="card-enhanced animate-scale-in animate-stagger-3 hover-glow transition-all duration-300">
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
    </div>
  );
}
