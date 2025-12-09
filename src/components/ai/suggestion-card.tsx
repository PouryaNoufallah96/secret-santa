"use client";

import { Gift, Sparkles, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/secret-santa";
import type { Currency } from "@/lib/types";

interface Suggestion {
  name: string;
  description: string;
  estimatedPrice: number;
  reasoning: string;
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  currency: Currency;
  index: number;
}

export function SuggestionCard({ suggestion, currency, index }: SuggestionCardProps) {
  const colors = [
    "from-christmas-red/10 to-christmas-red/5 border-christmas-red/20",
    "from-christmas-green/10 to-christmas-green/5 border-christmas-green/20",
    "from-christmas-gold/10 to-christmas-gold/5 border-christmas-gold/20",
    "from-purple-500/10 to-purple-500/5 border-purple-500/20",
    "from-blue-500/10 to-blue-500/5 border-blue-500/20",
  ];

  const colorClass = colors[index % colors.length];

  return (
    <Card className={`bg-gradient-to-br ${colorClass} transition-all hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-background/80 rounded-lg flex-shrink-0">
            <Gift className="h-5 w-5 text-christmas-red" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base">{suggestion.name}</h3>
              <Badge variant="secondary" className="flex-shrink-0">
                <DollarSign className="h-3 w-3 mr-0.5" />
                {formatPrice(suggestion.estimatedPrice * 100, currency)}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">{suggestion.description}</p>

            <div className="flex items-start gap-2 pt-2 border-t border-border/50">
              <Sparkles className="h-3 w-3 mt-1 text-christmas-gold flex-shrink-0" />
              <p className="text-xs text-muted-foreground italic">
                {suggestion.reasoning}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
