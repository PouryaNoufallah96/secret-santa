"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Gift } from "lucide-react";
import { GetSuggestionsButton } from "@/components/ai/get-suggestions-btn";
import { SuggestionList } from "@/components/ai/suggestion-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, getInitials } from "@/lib/secret-santa";
import type { Currency } from "@/lib/types";

interface Suggestion {
  name: string;
  description: string;
  estimatedPrice: number;
  reasoning: string;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  image: string | null;
  interests: string[];
  bio: string | null;
}

interface GroupData {
  id: string;
  name: string;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
}

export default function SuggestionsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [budgetRange, setBudgetRange] = useState<{ min: number; max: number }>({
    min: 10,
    max: 100,
  });

  useEffect(() => {
    async function fetchRecipient() {
      try {
        const response = await fetch(`/api/wishlists/recipient/${groupId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError(
              "No assignment found. The draw may not have been completed yet."
            );
          } else {
            setError("Failed to load recipient data");
          }
          return;
        }

        const data = await response.json();
        setRecipient(data.recipient);
        setGroupData(data.group);
        setCurrency(data.group.currency as Currency);
        setBudgetRange({
          min: data.group.budgetMin || 10,
          max: data.group.budgetMax || 100,
        });
      } catch {
        setError("Failed to load recipient data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecipient();
  }, [groupId]);

  const handleSuggestions = (data: {
    suggestions: Suggestion[];
    currency: string;
    budgetRange: { min: number; max: number };
  }) => {
    setSuggestions(data.suggestions);
    setCurrency(data.currency as Currency);
    setBudgetRange(data.budgetRange);
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christmas-red" />
        </div>
      </div>
    );
  }

  if (error || !recipient || !groupData) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="border-destructive/30">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Unable to Load</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={`/groups/${groupId}/wishlist`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Wishlist
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-christmas-gold/10 rounded-lg">
          <Sparkles className="h-6 w-6 text-christmas-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Gift Suggestions</h1>
          <p className="text-muted-foreground">
            Personalized gift ideas for your Secret Santa recipient
          </p>
        </div>
      </div>

      {/* Recipient Info Card */}
      <Card className="mb-6 border-christmas-green/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-christmas-gold">
              <AvatarImage
                src={recipient.image || ""}
                alt={recipient.name}
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="bg-christmas-red text-white">
                {getInitials(recipient.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Gift ideas for</p>
              <h2 className="font-semibold">{recipient.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="font-medium">
                {formatPrice(budgetRange.min, currency)} -{" "}
                {formatPrice(budgetRange.max, currency)}
              </p>
            </div>
          </div>

          {recipient.interests && recipient.interests.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Their interests:
              </p>
              <div className="flex flex-wrap gap-2">
                {recipient.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center mb-6">
        <GetSuggestionsButton
          groupId={groupId}
          onSuggestions={handleSuggestions}
          onError={setSuggestionsError}
          onLoadingChange={setIsSuggestionsLoading}
          hasSuggestions={suggestions.length > 0}
        />
      </div>

      {/* Suggestions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-christmas-red" />
            Gift Ideas
          </CardTitle>
          <CardDescription>
            AI-generated suggestions based on {recipient.name}&apos;s interests
            and wishlist style. These are unique ideas, not items from their
            wishlist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SuggestionList
            suggestions={suggestions}
            currency={currency}
            isLoading={isSuggestionsLoading}
            error={suggestionsError}
          />
        </CardContent>
      </Card>

      {/* Tips */}
      {suggestions.length > 0 && (
        <Card className="mt-6 bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> These are AI-generated suggestions. Consider
              checking their wishlist for specific items they want, or use these
              ideas as inspiration for finding the perfect gift!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
