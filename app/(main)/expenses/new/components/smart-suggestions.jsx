"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Clock, TrendingUp, X, Check, Users } from "lucide-react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { getCategoryById } from "@/lib/expense-categories";
import { toast } from "sonner";

export function SmartSuggestions({ onSuggestionSelect, participants = [], groupId = null }) {
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const { data: suggestions } = useConvexQuery(api.suggestions.getSmartSuggestions);
  const useSuggestion = useConvexMutation(api.suggestions.useSuggestion);
  const dismissSuggestion = useConvexMutation(api.suggestions.dismissSuggestion);
  const generateSuggestions = useConvexMutation(api.suggestions.generateSmartSuggestions);

  const handleSuggestionClick = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setCustomAmount(suggestion.avgAmount.toFixed(2));
    setIsDialogOpen(true);
  };

  const handleUseSuggestion = async () => {
    if (!selectedSuggestion) return;

    try {
      const amount = parseFloat(customAmount) || selectedSuggestion.avgAmount;
      
      // If onSuggestionSelect callback is provided, use it instead
      if (onSuggestionSelect) {
        onSuggestionSelect({
          description: selectedSuggestion.description,
          amount,
          category: selectedSuggestion.category,
        });
        setIsDialogOpen(false);
        toast.success("Suggestion applied to form");
        return;
      }

      // Otherwise create the expense directly
      const participantIds = participants.length > 0 
        ? participants.map(p => p.id) 
        : [selectedSuggestion.userId];

      await useSuggestion.mutate({
        suggestionId: selectedSuggestion._id,
        amount,
        participants: participantIds,
        groupId,
      });

      setIsDialogOpen(false);
      toast.success("Expense created from suggestion");
    } catch {
      toast.error("Failed to use suggestion");
    }
  };

  const handleDismissSuggestion = async (suggestionId) => {
    try {
      await dismissSuggestion.mutate({ suggestionId });
      toast.success("Suggestion dismissed");
    } catch {
      toast.error("Failed to dismiss suggestion");
    }
  };

  const handleGenerateSuggestions = async () => {
    try {
      const count = await generateSuggestions.mutate({});
      toast.success(`Generated ${count} new suggestions`);
    } catch {
      toast.error("Failed to generate suggestions");
    }
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case "daily": return "bg-red-100 text-red-800";
      case "weekly": return "bg-blue-100 text-blue-800";
      case "monthly": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!suggestions) {
    return (
      <Card className="animate-fade-in hover-glow">
        <CardContent className="py-8 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading suggestions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="animate-fade-in hover-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Smart Suggestions
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateSuggestions}
              className="animate-hover-lift"
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.length === 0 ? (
            <div className="text-center py-6">
              <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                No suggestions available yet. Create more expenses to get personalized suggestions.
              </p>
              <Button
                variant="outline"
                onClick={handleGenerateSuggestions}
                className="animate-hover-lift"
              >
                Generate Suggestions
              </Button>
            </div>
          ) : (
            suggestions.map((suggestion, index) => {
              const category = getCategoryById(suggestion.category);
              const CategoryIcon = category.icon;

              return (
                <div
                  key={suggestion._id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all animate-slide-up animate-stagger-${index + 1} hover:shadow-md hover:border-primary/50 relative group`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismissSuggestion(suggestion._id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  <div className="flex items-start justify-between pr-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="bg-primary/10 p-1 rounded">
                          <CategoryIcon className="h-3 w-3 text-primary" />
                        </div>
                        <span className="font-medium text-sm">{suggestion.description}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {suggestion.frequency}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          ${suggestion.avgAmount.toFixed(2)} avg
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getFrequencyColor(suggestion.frequency)}`}
                        >
                          {Math.round(suggestion.confidence * 100)}% match
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Use Suggestion</DialogTitle>
          </DialogHeader>
          {selectedSuggestion && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium">{selectedSuggestion.description}</h4>
                <p className="text-sm text-muted-foreground">
                  Category: {getCategoryById(selectedSuggestion.category).name}
                </p>
              </div>
              
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Suggested: ${selectedSuggestion.avgAmount.toFixed(2)}
                </p>
              </div>

              {participants.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Will be split with {participants.length} participant{participants.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {participants.slice(0, 3).map((participant) => (
                      <Badge key={participant.id} variant="outline" className="text-xs">
                        {participant.name}
                      </Badge>
                    ))}
                    {participants.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{participants.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUseSuggestion}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {onSuggestionSelect ? "Use Suggestion" : "Create Expense"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
