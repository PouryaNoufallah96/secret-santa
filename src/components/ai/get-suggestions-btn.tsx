"use client";

import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GetSuggestionsButtonProps {
  groupId: string;
  onSuggestions: (data: {
    suggestions: Array<{
      name: string;
      description: string;
      estimatedPrice: number;
      reasoning: string;
    }>;
    currency: string;
    budgetRange: { min: number; max: number };
  }) => void;
  onError: (error: string) => void;
  onLoadingChange: (isLoading: boolean) => void;
  hasSuggestions?: boolean;
  disabled?: boolean;
}

export function GetSuggestionsButton({
  groupId,
  onSuggestions,
  onError,
  onLoadingChange,
  hasSuggestions = false,
  disabled = false,
}: GetSuggestionsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    onLoadingChange(true);
    onError("");

    try {
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate suggestions");
      }

      onSuggestions(data);
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Failed to generate suggestions"
      );
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className="bg-gradient-to-r from-christmas-gold to-christmas-gold/80 hover:from-christmas-gold/90 hover:to-christmas-gold/70 text-black"
    >
      {isLoading ? (
        <>
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : hasSuggestions ? (
        <>
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate Ideas
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          Get AI Gift Ideas
        </>
      )}
    </Button>
  );
}
