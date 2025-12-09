"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Lock, Gift } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { ExchangeCard } from "@/components/history/exchange-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SnowflakeSpinner } from "@/components/ui/snowflake-spinner";
import { useSession } from "@/lib/auth-client";

interface GiftInfo {
  toName?: string;
  toImage?: string | null;
  fromName?: string;
  fromImage?: string | null;
  description: string | null;
  imageUrl: string | null;
}

interface ExchangeHistory {
  groupId: string;
  groupName: string;
  exchangeDate: string | null;
  currency: string;
  budgetMin: number | null;
  budgetMax: number | null;
  year: number;
  gave: GiftInfo | null;
  received: GiftInfo | null;
}

export default function HistoryPage() {
  const { data: session, isPending } = useSession();
  const [history, setHistory] = useState<ExchangeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    async function fetchHistory() {
      try {
        const res = await fetch("/api/history");
        if (!res.ok) {
          throw new Error("Failed to fetch history");
        }
        const data = await res.json();
        setHistory(data.history);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [session]);

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <SnowflakeSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              You need to sign in to view your gift history
            </p>
          </div>
          <UserProfile />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <SnowflakeSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-nunito text-christmas-red dark:text-christmas-gold flex items-center gap-3">
          <History className="h-8 w-8" />
          Gift Exchange History
        </h1>
        <p className="text-muted-foreground mt-2">
          A look back at your past Secret Santa exchanges
        </p>
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="No History Yet"
          description="Your past Secret Santa exchanges will appear here once groups are archived."
          variant="festive"
        >
          <Button asChild>
            <Link href="/groups">View Your Groups</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {history.map((exchange) => (
            <ExchangeCard key={exchange.groupId} exchange={exchange} />
          ))}
        </div>
      )}
    </div>
  );
}
