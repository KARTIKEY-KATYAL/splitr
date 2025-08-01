"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ParticipantSelector } from "./participant-selector";
import { GroupSelector } from "./group-selector";
import { CategorySelector } from "./category-selector";
import { SplitSelector } from "./split-selector";
import { SmartSuggestions } from "./smart-suggestions";
import { ReceiptScanner } from "./receipt-scanner";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Camera } from "lucide-react";
import { getAllCategories } from "@/lib/expense-categories";

// Form schema validation
const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  category: z.string().optional(),
  date: z.date(),
  paidByUserId: z.string().min(1, "Payer is required"),
  splitType: z.enum(["equal", "percentage", "exact"]),
  groupId: z.string().optional(),
});

export function ExpenseForm({ type = "individual", onSuccess }) {
  const [participants, setParticipants] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [splits, setSplits] = useState([]);
  const [receiptData, setReceiptData] = useState(null);
  const [activeTab, setActiveTab] = useState("manual");

  // Mutations and queries
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);

  const createExpense = useConvexMutation(api.expenses.createExpense);
  const categories = getAllCategories();

  // Set up form with validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      date: new Date(),
      paidByUserId: currentUser?._id || "",
      splitType: "equal",
      groupId: undefined,
    },
  });

  // Watch for changes
  const amountValue = watch("amount");
  const paidByUserId = watch("paidByUserId");

  // When a user is added or removed, update the participant list
  useEffect(() => {
    if (participants.length === 0 && currentUser) {
      // Always add the current user as a participant
      setParticipants([
        {
          id: currentUser._id,
          name: currentUser.name,
          email: currentUser.email,
          imageUrl: currentUser.imageUrl,
        },
      ]);
    }
  }, [currentUser, participants]);

  // Handle form submission
  const onSubmit = async (data) => {
    if (!splits.length) {
      toast.error("Please add participants and configure splits");
      return;
    }

    try {
      const expenseData = {
        description: data.description,
        amount: parseFloat(data.amount),
        category: data.category,
        date: selectedDate.getTime(),
        paidByUserId: data.paidByUserId,
        splitType: data.splitType,
        splits: splits.map((split) => ({
          userId: split.userId,
          amount: split.amount,
          paid: split.paid,
        })),
        groupId: selectedGroup?._id,
      };

      // Add receipt data if available
      if (receiptData) {
        expenseData.receiptImageUrl = receiptData.receiptImageUrl;
        expenseData.receiptData = receiptData.receiptData;
      }

      const expenseId = await createExpense.mutate(expenseData);

      toast.success("Expense created successfully!");
      reset();
      setParticipants([]);
      setSplits([]);
      setReceiptData(null);
      setActiveTab("manual");

      if (onSuccess) {
        onSuccess(expenseId);
      }
    } catch (error) {
      toast.error("Failed to create expense: " + error.message);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setValue("description", suggestion.description);
    setValue("amount", suggestion.amount.toString());
    setValue("category", suggestion.category);

    if (suggestion.receiptImageUrl) {
      setReceiptData({
        receiptImageUrl: suggestion.receiptImageUrl,
        receiptData: suggestion.receiptData,
      });
    }

    toast.success("Suggestion applied to form");
  };

  const handleReceiptParsed = (parsedData) => {
    setValue("description", parsedData.description);
    setValue("amount", parsedData.amount.toString());
    setValue("category", parsedData.category);

    setReceiptData({
      receiptImageUrl: parsedData.receiptImageUrl,
      receiptData: parsedData.receiptData,
    });

    setActiveTab("manual");
    toast.success("Receipt data applied to form");
  };

  if (!currentUser) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Description and amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Lunch, movie tickets, etc."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-error">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0.01"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-error">{errors.amount.message}</p>
            )}
          </div>
        </div>

        {/* Category and date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>

            <CategorySelector
              categories={categories || []}
              onChange={(categoryId) => {
                if (categoryId) {
                  setValue("category", categoryId);
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setValue("date", date);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Group selector (for group expenses) */}
        {type === "group" && (
          <div className="space-y-2">
            <Label>Group</Label>
            <GroupSelector
              onChange={(group) => {
                // Only update if the group has changed to prevent loops
                if (!selectedGroup || selectedGroup.id !== group.id) {
                  setSelectedGroup(group);
                  setValue("groupId", group.id);

                  // Update participants with the group members
                  if (group.members && Array.isArray(group.members)) {
                    // Set the participants once, don't re-set if they're the same
                    setParticipants(group.members);
                  }
                }
              }}
            />
            {!selectedGroup && (
              <p className="text-xs text-muted-foreground">
                Please select a group to continue
              </p>
            )}
          </div>
        )}

        {/* Participants (for individual expenses) */}
        {type === "individual" && (
          <div className="space-y-2">
            <Label>Participants</Label>
            <ParticipantSelector
              participants={participants}
              onParticipantsChange={setParticipants}
            />
            {participants.length <= 1 && (
              <p className="text-xs text-muted-foreground">
                Please add at least one other participant
              </p>
            )}
          </div>
        )}

        {/* Paid by selector */}
        <div className="space-y-2">
          <Label>Paid by</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register("paidByUserId")}
          >
            <option value="">Select who paid</option>
            {participants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.id === currentUser._id ? "You" : participant.name}
              </option>
            ))}
          </select>
          {errors.paidByUserId && (
            <p className="text-sm text-error">
              {errors.paidByUserId.message}
            </p>
          )}
        </div>

        {/* Split type */}
        <div className="space-y-2">
          <Label>Split type</Label>
          <Tabs
            defaultValue="equal"
            onValueChange={(value) => setValue("splitType", value)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="equal">Equal</TabsTrigger>
              <TabsTrigger value="percentage">Percentage</TabsTrigger>
              <TabsTrigger value="exact">Exact Amounts</TabsTrigger>
            </TabsList>
            <TabsContent value="equal" className="pt-4">
              <p className="text-sm text-muted-foreground">
                Split equally among all participants
              </p>
              <SplitSelector
                type="equal"
                amount={parseFloat(amountValue) || 0}
                participants={participants}
                paidByUserId={paidByUserId}
                onSplitsChange={setSplits} // Use setSplits directly
              />
            </TabsContent>
            <TabsContent value="percentage" className="pt-4">
              <p className="text-sm text-muted-foreground">
                Split by percentage
              </p>
              <SplitSelector
                type="percentage"
                amount={parseFloat(amountValue) || 0}
                participants={participants}
                paidByUserId={paidByUserId}
                onSplitsChange={setSplits} // Use setSplits directly
              />
            </TabsContent>
            <TabsContent value="exact" className="pt-4">
              <p className="text-sm text-muted-foreground">
                Enter exact amounts
              </p>
              <SplitSelector
                type="exact"
                amount={parseFloat(amountValue) || 0}
                participants={participants}
                paidByUserId={paidByUserId}
                onSplitsChange={setSplits} // Use setSplits directly
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Smart Suggestions and Receipt Scanner */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="mb-0">Smart Suggestions</Label>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveTab("scanner")}
            >
              <Camera className="h-5 w-5" />
            </Button>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="scanner">Receipt Scanner</TabsTrigger>
            </TabsList>
            <TabsContent value="manual" className="pt-4">
              <SmartSuggestions
                onSelect={handleSuggestionSelect}
                participants={participants}
                amount={amountValue}
                currentUserId={currentUser._id}
              />
            </TabsContent>
            <TabsContent value="scanner" className="pt-4">
              <ReceiptScanner onParsed={handleReceiptParsed} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || participants.length <= 1}
          className="btn-red"
        >
          {isSubmitting ? "Creating..." : "Create Expense"}
        </Button>
      </div>
    </form>
  );
}
