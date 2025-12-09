"use client";

import { Sparkles, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SuggestionCard } from "./suggestion-card";
import type { Currency } from "@/lib/types";

interface Suggestion {
  name: string;
  description: string;
  estimatedPrice: number;
  reasoning: string;
}

interface SuggestionListProps {
  suggestions: Suggestion[];
  currency: Currency;
  isLoading?: boolean;
  error?: string | null;
}

export function SuggestionList({
  suggestions,
  currency,
  isLoading = false,
  error = null,
}: SuggestionListProps) {
  if (isLoading) {
    return (
      <Card className="border-christmas-gold/30">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <Sparkles className="h-12 w-12 text-christmas-gold animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-2 border-christmas-gold/30 rounded-full animate-spin border-t-christmas-gold" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Generating Gift Ideas...</h3>
              <p className="text-sm text-muted-foreground">
                Our AI is finding perfect gift suggestions based on their interests
                and wishlist.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="space-y-2">
              <h3 className="font-semibold">Failed to Generate Suggestions</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <Sparkles className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="font-semibold">No Suggestions Yet</h3>
              <p className="text-sm text-muted-foreground">
                Click the button above to get AI-powered gift suggestions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map((suggestion, index) => (
        <SuggestionCard
          key={index}
          suggestion={suggestion}
          currency={currency}
          index={index}
        />
      ))}
    </div>
  );
}
