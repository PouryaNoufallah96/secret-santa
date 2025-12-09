"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Plus, Sparkles } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { GroupForm } from "@/components/groups/group-form";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { SnowflakeSpinner } from "@/components/ui/snowflake-spinner";
import { Card } from "@/components/ui/card";

export default function NewGroupPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: {
    name: string;
    description?: string;
    budgetMin?: number;
    budgetMax?: number;
    currency: string;
    exchangeDate?: string;
  }) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create group");
      }

      const { group } = await res.json();
      router.push(`/groups/${group.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <SnowflakeSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full p-8 text-center border-none shadow-xl bg-card/80 backdrop-blur">
          <Lock className="w-16 h-16 mx-auto mb-4 text-christmas-red" />
          <h1 className="text-2xl font-bold mb-2 font-nunito">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to sign in to create a Sleigh group
          </p>
          <UserProfile />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-12">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-christmas-red/5 to-transparent -z-10" />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/groups">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Groups
            </Link>
          </Button>
        </div>

        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-christmas-red/10 flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-christmas-red" />
          </div>
          <h1 className="text-4xl font-bold font-nunito text-christmas-red dark:text-christmas-gold mb-2">
            Create a New Sleigh Group
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Start a new tradition! Set up your gift exchange details below.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6 text-center font-medium">
            {error}
          </div>
        )}

        <div className="bg-card border-none shadow-xl rounded-2xl p-6 md:p-8 relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-24 h-24 text-christmas-gold" />
          </div>
          <GroupForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
}
