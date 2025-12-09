"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, Gift, Users } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { isValidInviteCode } from "@/lib/secret-santa";
import { SnowflakeSpinner } from "@/components/ui/snowflake-spinner";

function JoinGroupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [groupPreview, setGroupPreview] = useState<{
    id: string;
    name: string;
    memberCount: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure consistent rendering between server and client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill from URL query param
  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setInviteCode(codeFromUrl.toUpperCase());
    }
  }, [searchParams]);

  // Look up group when code changes
  useEffect(() => {
    if (!session || !isValidInviteCode(inviteCode)) {
      setGroupPreview(null);
      return;
    }

    const lookupGroup = async () => {
      setLookupLoading(true);
      try {
        const res = await fetch(`/api/groups/lookup?code=${inviteCode}`);
        if (res.ok) {
          const data = await res.json();
          setGroupPreview(data.group);
        } else {
          setGroupPreview(null);
        }
      } catch {
        setGroupPreview(null);
      } finally {
        setLookupLoading(false);
      }
    };

    const debounce = setTimeout(lookupGroup, 300);
    return () => clearTimeout(debounce);
  }, [inviteCode, session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isValidInviteCode(inviteCode)) {
      setError("Please enter a valid 8-character invite code");
      setLoading(false);
      return;
    }

    try {
      // First, find the group by invite code
      const lookupRes = await fetch(`/api/groups/lookup?code=${inviteCode}`);
      if (!lookupRes.ok) {
        const errorData = await lookupRes.json();
        throw new Error(errorData.error || "Invalid invite code");
      }
      const { group } = await lookupRes.json();

      // Then join the group
      const joinRes = await fetch(`/api/groups/${group.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });

      if (!joinRes.ok) {
        const errorData = await joinRes.json();
        throw new Error(errorData.error || "Failed to join group");
      }

      router.push(`/groups/${group.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  }

  // Show loading spinner until mounted and session is ready
  if (!mounted || isPending) {
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
            You need to sign in to join a Secret Santa group
          </p>
          <UserProfile />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-christmas-red/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-christmas-green/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-10" />

      <div className="container mx-auto px-4 py-8 max-w-md relative z-10 flex-1 flex flex-col justify-center">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/groups">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Groups
            </Link>
          </Button>
        </div>

        <Card className="border-none shadow-xl bg-card/80 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-christmas-red to-berry-red flex items-center justify-center shadow-lg">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="font-nunito text-3xl font-bold">Join the Fun!</CardTitle>
            <CardDescription className="text-lg">
              Enter your invite code to join the Sleigh group
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="inviteCode" className="text-center block text-muted-foreground">
                  ENTER INVITE CODE
                </Label>
                <div className="relative">
                  <Input
                    id="inviteCode"
                    placeholder="SLEIGH24"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    className="text-center text-4xl h-16 tracking-[0.2em] font-mono uppercase border-2 focus-visible:ring-christmas-red focus-visible:border-christmas-red rounded-xl font-bold placeholder:text-muted-foreground/20"
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  8-character code (letters and numbers)
                </p>
              </div>

              {/* Group Preview */}
              <div className="min-h-[80px]">
                {lookupLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <SnowflakeSpinner size="sm" />
                  </div>
                ) : groupPreview ? (
                  <div className="bg-christmas-green/10 border border-christmas-green/20 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-christmas-green flex items-center justify-center text-white">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-lg leading-none mb-1">{groupPreview.name}</p>
                        <p className="text-sm text-muted-foreground">{groupPreview.memberCount} members ready to gift</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm font-medium text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-christmas-red hover:bg-christmas-red/90 text-white font-bold text-lg h-12 rounded-xl shadow-md hover:shadow-lg transition-all"
                disabled={loading || !isValidInviteCode(inviteCode)}
              >
                {loading ? (
                  <SnowflakeSpinner size="sm" className="mr-2" />
                ) : (
                  "Join Group"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function JoinGroupPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-background">
        <SnowflakeSpinner size="lg" />
      </div>
    }>
      <JoinGroupForm />
    </Suspense>
  );
}
